from datetime import datetime
import uuid
from decimal import Decimal

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import NotFound
from rest_framework.generics import ListAPIView, RetrieveAPIView
from django.shortcuts import get_object_or_404
from django.apps import apps
from django.db import transaction

from common.filters import filter_transactions_by_duration
from eWallet.managers import IncomeExpenditureAnalysisManager
from .models import Account, Card, CustomUser, Transaction, QRCode
from .serializers import AccountSerializer, CardSerializer, CreditTransactionSerializer, CustomUserSerializer, DebitTransactionSerializer, FundCardSerializer, GetUserSerializer, IncomeExpenditureSerializer, LoginSerializer, QRCodeSerializer, TransactionSerializer



class CustomUserAPIView(APIView):
    
    def get(self, request, user_id=None):
        """Retrieve a single user (if ID is provided) or all users"""
        if user_id:
            user = get_object_or_404(CustomUser, id=user_id)
            serializer = CustomUserSerializer(user)
        else:
            users = CustomUser.objects.all()
            serializer = CustomUserSerializer(users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        """Create a new user"""
        serializer = CustomUserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, user_id):
        """Update a user (full update)"""
        user = get_object_or_404(CustomUser, id=user_id)
        serializer = CustomUserSerializer(user, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, user_id):
        """Update a user (partial update)"""
        user = get_object_or_404(CustomUser, id=user_id)
        serializer = CustomUserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, user_id):
        """Delete a user"""
        user = get_object_or_404(CustomUser, id=user_id)
        user.delete()
        return Response({"message": "User deleted successfully"}, status=status.HTTP_204_NO_CONTENT)



class GetAuthenticatedUserAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        serializer = GetUserSerializer(user)
        return Response(serializer.data)


class LoginAPIView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            return Response(serializer.validated_data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    


class UserAccountDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Fetch the authenticated user's account details."""
        try:
            account = Account.objects.get(user=request.user)
            serializer = AccountSerializer(account)
            return Response(serializer.data, status=200)
        except Account.DoesNotExist:
            return Response({"error": "Account not found"}, status=404)
        

class CardAPIView(APIView):
    """
    API View to handle card creation and retrieval for the authenticated user.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Get the last created card for the authenticated user.
        """
        card = Card.objects.filter(account__user=request.user).order_by("-id").first() 
        
        if not card:
            return Response({"error": "No card found for this user."}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = CardSerializer(card)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        """
        Create a new card for the authenticated user.
        """
        try:
            account = Account.objects.get(user=request.user)  
        except Account.DoesNotExist:
            return Response({"error": "Account not found for this user."}, status=status.HTTP_404_NOT_FOUND)

        serializer = CardSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            serializer.save(account=account)  
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class FundCardView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = FundCardSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            response_data = serializer.save()
            return Response(response_data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    


class DebitTransactionAPIView(APIView):
    """Handles debit transactions (expenditure)"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Retrieve all debit transactions for the authenticated user"""
        transactions = Transaction.objects.filter(account__user=request.user, transaction_type="expenditure")
        serializer = DebitTransactionSerializer(transactions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        """Create a new debit transaction"""
        serializer = DebitTransactionSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, transaction_id):
        """Update a specific debit transaction"""
        try:
            transaction = Transaction.objects.get(id=transaction_id, account__user=request.user, transaction_type="expenditure")
        except Transaction.DoesNotExist:
            return Response({"error": "Transaction not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = DebitTransactionSerializer(transaction, data=request.data, partial=True, context={"request": request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, transaction_id):
        """Delete a specific debit transaction"""
        try:
            transaction = Transaction.objects.get(id=transaction_id, account__user=request.user, transaction_type="expenditure")
            transaction.delete()
            return Response({"message": "Transaction deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
        except Transaction.DoesNotExist:
            return Response({"error": "Transaction not found"}, status=status.HTTP_404_NOT_FOUND)


class CreditTransactionAPIView(APIView):
    """Handles credit transactions (income)"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Retrieve all credit transactions for the authenticated user"""
        transactions = Transaction.objects.filter(account__user=request.user, transaction_type="income")
        serializer = CreditTransactionSerializer(transactions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        """Create a new credit transaction"""
        serializer = CreditTransactionSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, transaction_id):
        """Update a specific credit transaction"""
        try:
            transaction = Transaction.objects.get(id=transaction_id, account__user=request.user, transaction_type="income")
        except Transaction.DoesNotExist:
            return Response({"error": "Transaction not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = CreditTransactionSerializer(transaction, data=request.data, partial=True, context={"request": request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, transaction_id):
        """Delete a specific credit transaction"""
        try:
            transaction = Transaction.objects.get(id=transaction_id, account__user=request.user, transaction_type="income")
            transaction.delete()
            return Response({"message": "Transaction deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
        except Transaction.DoesNotExist:
            return Response({"error": "Transaction not found"}, status=status.HTTP_404_NOT_FOUND)
        



class ScanQRCodeView(APIView):
    """
    API to scan a QR code and retrieve user details.
    """

    def post(self, request):
        qr_data = request.data.get("qr_data")  

        if not qr_data:
            return Response({"error": "QR data is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user_id = qr_data.split(":")[1]
            user = CustomUser.objects.get(id=user_id)
            return Response(
                {"user_id": user.id, "email": user.email, "name": user.full_name},
                status=status.HTTP_200_OK,
            )

        except CustomUser.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        


class SendMoneyViaQRView(APIView):
    """
    API to send money by scanning a QR code.
    """
    permission_classes = [IsAuthenticated]  

    def post(self, request):
        sender = request.user  
        qr_data = request.data.get("qr_data")
        amount = request.data.get("amount")

        if not qr_data or not amount:
            return Response({"error": "QR data and amount are required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            amount = float(amount) 
            if amount <= 0:
                return Response({"error": "Invalid amount"}, status=status.HTTP_400_BAD_REQUEST)

            receiver_id = qr_data.split(":")[1] 
            receiver = CustomUser.objects.get(id=receiver_id)

            sender_account = sender.account
            receiver_account = receiver.account

            if sender_account.balance < amount:
                return Response({"error": "Insufficient funds"}, status=status.HTTP_400_BAD_REQUEST)

            sender_account.balance -= amount
            sender_account.save()

            receiver_account.balance += amount
            receiver_account.save()

            Transaction.objects.create(account=sender_account, amount=amount, transaction_type="expenditure", description="QR Payment")
            Transaction.objects.create(account=receiver_account, amount=amount, transaction_type="income", description="QR Payment")

            return Response({"message": "Payment successful!"}, status=status.HTTP_200_OK)

        except CustomUser.DoesNotExist:
            return Response({"error": "Receiver not found"}, status=status.HTTP_404_NOT_FOUND)

        except ValueError:
            return Response({"error": "Invalid amount format"}, status=status.HTTP_400_BAD_REQUEST)
        


class IncomeExpenditureAPIView(APIView):
    """
    API View to get total income and expenditure for the authenticated user.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        data = Transaction.analysis.get_income_expenditure(user)
        serializer = IncomeExpenditureSerializer(data)
        return Response(serializer.data)


class IncomeExpenditureByDateAPIView(APIView):
    """
    API View to get income and expenditure for the authenticated user within a date range.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        start_date_str = request.query_params.get("start_date")
        end_date_str = request.query_params.get("end_date")

        if not start_date_str or not end_date_str:
            return Response({"error": "Please provide start_date and end_date in YYYY-MM-DD format."}, status=400)

        try:
            start_date = datetime.strptime(start_date_str, "%Y-%m-%d")
            end_date = datetime.strptime(end_date_str, "%Y-%m-%d")
        except ValueError:
            return Response({"error": "Invalid date format. Use YYYY-MM-DD."}, status=400)

        data = Transaction.analysis.get_income_expenditure_by_date(user, start_date, end_date)
        serializer = IncomeExpenditureSerializer(data)
        return Response(serializer.data)
    

class UserTransactionsAPIView(ListAPIView):
    """
    API View to list all transactions for the authenticated user.
    """
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Transaction.objects.filter(account__user=self.request.user).order_by('-created_at')
    


class CompareMonthlyDepositsDebitsAPIView(APIView):
    """
    API View to compare deposits and debits for the authenticated user within a selected duration.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        duration = request.query_params.get("duration", "all") 
        


        data = filter_transactions_by_duration(user, duration)

        return Response(data)
    


class UserQRCodeAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            qr_code = QRCode.objects.get(user=request.user)
            serializer = QRCodeSerializer(qr_code)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except QRCode.DoesNotExist:
            return Response({"error": "QR Code not found for this user."}, status=status.HTTP_404_NOT_FOUND)
        

class PayCustomerAPIView(APIView):
    permission_classes = [IsAuthenticated,]

    def post(self, request, customer_id):
        with transaction.atomic():
            try:
                amount = self.request.data["amount"]
                amount = Decimal(amount)
            except KeyError:
                return Response({"error": "Amount is required"}, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                customer_id = uuid.UUID(customer_id)
            except ValueError:
                return Response({"error": "Invalid customer ID"}, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                receiving_user = CustomUser.objects.get(id=customer_id)
            except CustomUser.DoesNotExist:
                return Response({"error": "Customer not found"}, status=status.HTTP_404_NOT_FOUND)
            
            user = self.request.user

            sending_user_wallet = Account.objects.get(user=user)

            receiving_user_wallet = Account.objects.get(user=receiving_user)

            if sending_user_wallet.balance < amount:
                return Response({"error": "Insufficient funds"}, status=status.HTTP_400_BAD_REQUEST)
            
            sending_user_wallet.balance -= amount
            sending_user_wallet.save()

            receiving_user_wallet.balance += amount
            receiving_user_wallet.save()

            Transaction.objects.create(
                account=sending_user_wallet,
                amount=amount,
                transaction_type="expenditure",
                description="Payment to customer",
                amount_before=sending_user_wallet.balance + amount,
                amount_after=sending_user_wallet.balance
            )

            Transaction.objects.create(
                account=receiving_user_wallet,
                amount=amount,
                transaction_type="income",
                description="Payment from user",
                amount_before=receiving_user_wallet.balance - amount,
                amount_after=receiving_user_wallet.balance
            )

            return Response({"message": "Payment successful!"}, status=status.HTTP_200_OK)
            




