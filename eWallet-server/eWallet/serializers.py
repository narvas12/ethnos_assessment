from django.forms import ValidationError
from rest_framework import serializers
from common.notifications import Notification
from .models import Card, CustomUser, Account, Transaction, QRCode
from django.contrib.auth import authenticate
from django.db import IntegrityError
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
from rest_framework_simplejwt.tokens import RefreshToken


class GetUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ["id", "full_name", "email", "phone_number", "is_verified", "is_blocked"]



class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'full_name', 'email', 'phone_number', 'is_verified', 'is_blocked', 'password']
        extra_kwargs = {
            'password': {'write_only': True},
        }

    def create(self, validated_data):
        password = validated_data.pop('password', None)  
        email = validated_data.get("email", "").strip().lower()  


        validated_data["username"] = email

        try:
            user = CustomUser(**validated_data)

            if password:
                user.set_password(password)  
            
            user.save() 
            return user

        except IntegrityError:
            raise ValidationError({"email": "A user with this email already exists."})

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)  

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if password:
            instance.set_password(password)  

        instance.save()  
        return instance


class AccountSerializer(serializers.ModelSerializer):
    user = CustomUserSerializer(read_only=True)

    class Meta:
        model = Account
        fields = ['id', 'user', 'account_name', 'account_number', 'balance']



class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data.get("email")
        password = data.get("password")

        user = authenticate(email=email, password=password)

        if not user:
            raise serializers.ValidationError("Invalid email or password.")
        if user.is_blocked:
            raise serializers.ValidationError("Your account is blocked. Contact support.")

        refresh = RefreshToken.for_user(user)

        return {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": {
                "id": user.id,
                "full_name": user.full_name,
                "email": user.email,
                "phone_number": user.phone_number,
                "is_verified": user.is_verified,
                "is_blocked": user.is_blocked,
            }
        }

class CardDetailSerializer(serializers.ModelSerializer):
    account = AccountSerializer(read_only=True)

    class Meta:
        model = Card
        fields = ["id", "account", "card_number", "card_holder_name", "expiry_date", "cvv", "card_type", "card_issuer", "card_balance"]


class CardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Card
        fields = ["id", "account", 'card_balance', "card_number", "card_holder_name", "expiry_date", "cvv", "card_type", "card_issuer"]
        extra_kwargs = {
            "card_holder_name": {"read_only": True},  
            "card_number": {"read_only": True},  
            "account": {"required": False},  
            "card_type": {"required": False}, 
            "card_issuer": {"required": False}, 
        }

    def validate(self, attrs):
        """Ensure the user does not already have a card from the same issuer"""
        user = self.context["request"].user
        card_issuer = attrs.get("card_issuer")

        if Card.objects.filter(account__user=user, card_issuer=card_issuer).exists():
            raise serializers.ValidationError(
                {"card_issuer": f"You already have a {card_issuer.capitalize()} card."}
            )

        return attrs

    def create(self, validated_data):
        user = self.context["request"].user  
        validated_data["card_holder_name"] = user.full_name  

        if "account" not in validated_data:
            validated_data["account"] = Account.objects.get(user=user)

        return super().create(validated_data)
    


class FundCardSerializer(serializers.Serializer):
    account_id = serializers.UUIDField()
    card_id = serializers.UUIDField()
    amount = serializers.DecimalField(max_digits=15, decimal_places=2)

    def validate(self, data):
        user = self.context["request"].user

        try:
            account = Account.objects.get(id=data["account_id"], user=user)
        except Account.DoesNotExist:
            raise serializers.ValidationError({"account": "Invalid account selection."})

        try:
            card = Card.objects.get(id=data["card_id"], account=account)
        except Card.DoesNotExist:
            raise serializers.ValidationError({"card": "Invalid card selection."})

        if account.balance < data["amount"]:
            raise serializers.ValidationError({"amount": "Insufficient funds in account."})

        data["account"] = account
        data["card"] = card
        return data

    def create(self, validated_data):
        account = validated_data["account"]
        card = validated_data["card"]
        amount = validated_data["amount"]

        account.balance -= amount
        account.save()

        card.card_balance = (card.card_balance or 0) + amount
        card.save()

        return {
            "message": "Card funded successfully",
            "card_balance": card.card_balance,
            "account_balance": account.balance,
        }

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ['id', 'account', 'amount', 'transaction_type', 'subtype', 'description', 'created_at']


class DebitTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ["id", "account", "amount", "transaction_type", "subtype", "description", "created_at"]
        read_only_fields = ["id", "transaction_type", "subtype", "created_at"]

    def validate(self, data):
        user = self.context["request"].user

        try:
            account = Account.objects.get(id=data["account"].id, user=user)
        except Account.DoesNotExist:
            raise serializers.ValidationError({"account": "Invalid account selection."})

        if account.balance < data["amount"]:
            raise serializers.ValidationError({"amount": "Insufficient balance."})

        data["account"] = account
        return data

    def create(self, validated_data):
        account = validated_data["account"]
        amount = validated_data["amount"]

        account.balance -= amount
        account.save()

        transaction = Transaction.objects.create(
            account=account,
            amount=amount,
            transaction_type="debit",
            subtype="expenditure",
            description=validated_data.get("description", ""),
        )
        return transaction



class CreditTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ["id", "account", "amount", "transaction_type", "subtype", "description", "created_at"]
        read_only_fields = ["id", "transaction_type", "subtype", "created_at"]

    def validate(self, data):
        user = self.context["request"].user

        try:
            account = Account.objects.get(id=data["account"].id, user=user)
        except Account.DoesNotExist:
            raise serializers.ValidationError({"account": "Invalid account selection."})

        data["account"] = account
        return data

    def create(self, validated_data):
        account = validated_data["account"]
        amount = validated_data["amount"]

        account.balance += amount
        account.save()

        transaction = Transaction.objects.create(
            account=account,
            amount=amount,
            transaction_type="deposit",
            subtype="income",
            description=validated_data.get("description", ""),
        )
        return transaction



class IncomeExpenditureSerializer(serializers.Serializer):
    total_income = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_expenditure = serializers.DecimalField(max_digits=15, decimal_places=2)


class MonthlyComparisonSerializer(serializers.Serializer):
    year = serializers.IntegerField()
    month = serializers.IntegerField()
    total_deposits = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_debits = serializers.DecimalField(max_digits=15, decimal_places=2)



class QRCodeSerializer(serializers.ModelSerializer):

    qr_image = serializers.SerializerMethodField("get_qr_image")


    @staticmethod
    def get_qr_image(obj: QRCode):
        domain = "http://127.0.0.1:8000"
        image_url = domain + obj.qr_image.url
        return image_url
    

    class Meta:
        model = QRCode
        fields = ["user", "qr_image"]
