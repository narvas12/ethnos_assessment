import random
import re
from django.conf import settings
import qrcode
from django.core.exceptions import ValidationError
from io import BytesIO
from django.core.files.base import ContentFile
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Card, CustomUser, Account, IncomeExpenditureAnalysis, QRCode, SpendingLog, Transaction

def clean_phone_number(phone_number):
    """Remove all non-numeric characters from phone number and extract last 10 digits."""
    if not phone_number:  # Handle case where phone number is None or empty
        raise ValidationError("Phone number is required to generate an account number.")

    digits_only = re.sub(r'\D', '', phone_number)  
    
    if len(digits_only) < 10:
        raise ValidationError("Invalid phone number. It must contain at least 10 digits.")

    return digits_only[-10:]  


@receiver(post_save, sender=CustomUser)
def create_user_account(sender, instance, created, **kwargs):
    """Create an account for new users (excluding superusers)."""
    if created and not instance.is_superuser:
        try:
            account_number = clean_phone_number(instance.phone_number)

            Account.objects.create(
                user=instance,
                account_name=f"{instance.full_name}'s Account",
                account_number=account_number,
            )
        except ValidationError as e:
            print(f"Error creating account for {instance.email}: {e}")

@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def generate_qr_code(sender, instance, created, **kwargs):
    """
    Generate and store QR Code when a new user is created.
    """
    if created:

        qr_data = (
            f"User ID: {instance.id}\n"
            f"Full Name: {instance.full_name}\n"
            f"Email: {instance.email}\n"
            f"Phone Number: {instance.phone_number}\n"
        )
        
        qr = qrcode.make(qr_data)

        buffer = BytesIO()
        qr.save(buffer, format="PNG")
        qr_image = ContentFile(buffer.getvalue(), name=f"qr_code_{instance.id}.png")

        QRCode.objects.create(user=instance, qr_image=qr_image)

@receiver(post_save, sender=Transaction)
def create_spending_log_and_analysis(sender, instance, created, **kwargs):
    """
    Signal to create a SpendingLog for expenditure transactions and update IncomeExpenditureAnalysis.
    """
    if created:
        analysis, _ = IncomeExpenditureAnalysis.objects.get_or_create(user=instance.account.user)

        if instance.transaction_type == "income":
            analysis.total_income += instance.amount
        elif instance.transaction_type == "expenditure":
            analysis.total_expenditure += instance.amount

            SpendingLog.objects.create(
                transaction=instance,
                category=instance.description,  
                timestamp=instance.created_at   
            )

        analysis.save()


@receiver(post_save, sender=Account)
def create_card_for_new_user(sender, instance, created, **kwargs):
    """
    Generate a card automatically when a new user signs up.
    """
    if created:  # Only create a card when a new account is created
        card_issuer = random.choice(["visa", "mastercard", "amex", "discover", "rupay"])
        card = Card.objects.create(
            account=instance,
            card_holder_name=instance.user.full_name,
            card_issuer=card_issuer,
        )
        card.save()