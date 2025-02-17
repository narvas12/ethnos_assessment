from datetime import date, timedelta
import random
import uuid
from django.conf import settings
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _
from django.contrib.auth.models import Permission, Group
from uuid import uuid4

from eWallet.managers import CustomUserManager, IncomeExpenditureAnalysisManager


class CustomUser(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    full_name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=15, unique=True)
    is_verified = models.BooleanField(default=False)
    is_blocked = models.BooleanField(default=False)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]


    objects = CustomUserManager()

    groups = models.ManyToManyField(
        Group,
        related_name="customuser_groups",  
        blank=True,
    )
    user_permissions = models.ManyToManyField(
        Permission,
        related_name="customuser_permissions",  
        blank=True,
    )

    class Meta:
        verbose_name = "Custom User"
        verbose_name_plural = "Custom Users"

    def __str__(self):
        return self.email


class Account(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="accounts")
    account_name = models.CharField(max_length=255)
    account_number = models.CharField(max_length=20)
    balance = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)

    def __str__(self):
        return f"{self.bank_name} - {self.account_name}"


class Card(models.Model):
    CARD_ISSUERS = [
        ("visa", "Visa"),
        ("mastercard", "MasterCard"),
        ("amex", "American Express"),
        ("discover", "Discover"),
        ("rupay", "RuPay"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)

    account = models.ForeignKey(Account, on_delete=models.CASCADE, related_name="cards")
    card_number = models.CharField(max_length=16, unique=True, blank=True)
    card_balance = models.DecimalField(max_digits=15, decimal_places=2, default=0.00, blank=True, null=True)
    card_holder_name = models.CharField(max_length=255)
    expiry_date = models.DateField(blank=True, null=True)
    cvv = models.CharField(max_length=4, blank=True)
    card_type = models.CharField(max_length=50, choices=[("debit", "Debit"), ("credit", "Credit")], db_default="debit")
    card_issuer = models.CharField(max_length=50, choices=CARD_ISSUERS, default="visa")

    def save(self, *args, **kwargs):
        """Generate card details before saving if not already set."""
        if not self.card_number:
            self.card_number = self.generate_card_number(self.card_issuer)
        
        if not self.expiry_date:
            self.expiry_date = self.generate_expiry_date()
        
        if not self.cvv:
            self.cvv = self.generate_cvv(self.card_issuer)

        super().save(*args, **kwargs)

    def generate_card_number(self, issuer):
        """Generates a valid 16-digit card number based on the issuer."""
        prefixes = {
            "visa": "4",
            "mastercard": str(random.choice(range(51, 56))), 
            "amex": "34",  
            "discover": "6011",
            "rupay": "65",
        }
        prefix = prefixes.get(issuer, "4") 
        card_number = prefix + "".join(str(random.randint(0, 9)) for _ in range(15 - len(prefix)))
        return self.luhn_algorithm(card_number)  

    def luhn_algorithm(self, partial_number):
        """Applies Luhn algorithm to generate a valid check digit"""
        digits = [int(d) for d in partial_number]
        for i in range(len(digits) - 1, -1, -2):
            digits[i] *= 2
            if digits[i] > 9:
                digits[i] -= 9
        check_digit = (10 - sum(digits) % 10) % 10
        return partial_number + str(check_digit)

    def generate_expiry_date(self):
        """Generates expiry date (1 year from creation date)"""
        return date.today() + timedelta(days=365)

    def generate_cvv(self, issuer):
        """Generates a CVV based on the issuer"""
        if issuer == "amex":
            return str(random.randint(1000, 9999))  
        return str(random.randint(100, 999)) 

    def __str__(self):
        return f"{self.card_issuer.capitalize()} {self.card_type.capitalize()} Card - {self.card_number[-4:]}"



class Transaction(models.Model):

    TRANSACTION_SUBTYPE_CHOICES = [
        ("income", "Income"),
        ("expenditure", "Expenditure"),
        ("transfer", "Transfer"),
    ]

    TRANSACTION_TYPE_CHOICES = [
        ("deposit", "Deposit"),  
        ("debit", "Debit"),  
    ]


    TRANSACTION_DESCRIPTION_CHOICES = [
        ("school_fee", "School Fee Payment"),
        ("grocery_shopping", "Grocery Shopping"),
        ("rent_payment", "Rent Payment"),
        ("utility_bills", "Utility Bills (Electricity, Water, Gas)"),
        ("medical_expenses", "Medical Expenses"),
        ("transportation", "Transportation (Bus, Train, Taxi)"),
        ("entertainment", "Entertainment & Leisure"),
        ("dining_out", "Dining Out & Restaurants"),
        ("loan_repayment", "Loan Repayment"),
        ("subscription_services", "Subscription Services (Netflix, Spotify)"),
        ("phone_recharge", "Phone Recharge & Data"),
        ("insurance_premium", "Insurance Premium Payment"),
        ("investment", "Investment & Stocks"),
        ("salary_payment", "Salary Payment"),
        ("charity_donation", "Charity & Donations"),
        ("online_shopping", "Online Shopping"),
        ("travel_booking", "Travel & Hotel Booking"),
        ("car_maintenance", "Car Maintenance & Fuel"),
        ("home_renovation", "Home Renovation & Repairs"),
        ("childcare", "Childcare & Babysitting"),
        ("fitness", "Gym & Fitness Membership"),
        ("education", "Education (Courses & Certifications)"),
        ("wedding_expenses", "Wedding Expenses"),
        ("pet_expenses", "Pet Care & Veterinary"),
        ("business_expenses", "Business & Office Supplies"),
        ("electronics", "Electronics & Gadgets"),
        ("legal_fees", "Legal Fees & Consultation"),
        ("festive_shopping", "Festive & Holiday Shopping"),
        ("gift_purchase", "Gift Purchase"),
        ("miscellaneous", "Miscellaneous"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    account = models.ForeignKey(Account, on_delete=models.CASCADE, related_name="transactions")
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    amount_before = models.DecimalField(max_digits=15, decimal_places=2, default=0.00, null=True, blank=True)
    amount_after = models.DecimalField(max_digits=15, decimal_places=2, default=0.00, null=True, blank=True)
    transaction_type = models.CharField(max_length=15, choices=TRANSACTION_TYPE_CHOICES)
    subtype = models.CharField(max_length=15, choices=TRANSACTION_SUBTYPE_CHOICES, null=True, blank=True)
    description = models.CharField(max_length=50, choices=TRANSACTION_DESCRIPTION_CHOICES, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    objects = IncomeExpenditureAnalysisManager()

    def __str__(self):
        return f"{self.transaction_type.capitalize()} - {self.amount}"


class QRCode(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name="qr_code")
    qr_image = models.ImageField(upload_to="qr_codes/")  

    def __str__(self):
        return f"QR Code for {self.user.email}"


class SpendingLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    transaction = models.OneToOneField(Transaction, on_delete=models.CASCADE, related_name="spending_log")
    category = models.CharField(max_length=50)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Spending on {self.category} - {self.transaction.amount}"


class IncomeExpenditureAnalysis(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name="income_expenditure_analysis")
    total_income = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    total_expenditure = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Analysis for {self.user.email}"





