from django.contrib.auth.models import BaseUserManager
from django.db import models
from django.db.models import Sum
from django.apps import apps

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        """Create and return a regular user with an email and password."""
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        extra_fields.setdefault("username", email.split("@")[0]) 
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        """Create and return a superuser with an email and password."""
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        return self.create_user(email, password, **extra_fields)



class IncomeExpenditureAnalysisManager(models.Manager):
    @staticmethod
    def get_income_expenditure(user):
        """
        Get total income and expenditure for a given user.
        """
        total_income = user.account.transactions.filter(subtype="income").aggregate(
            total=Sum("amount")
        )["total"] or 0.00

        total_expenditure = user.account.transactions.filter(subtype="expenditure").aggregate(
            total=Sum("amount")
        )["total"] or 0.00

        return {"total_income": total_income, "total_expenditure": total_expenditure}

    @staticmethod
    def get_income_expenditure_by_date(user, start_date, end_date):
        """
        Get total income and expenditure for a given user within a date range.
        """
        total_income = user.account.transactions.filter(
            subtype="income", created_at__range=[start_date, end_date]
        ).aggregate(total=Sum("amount"))["total"] or 0.00

        total_expenditure = user.account.transactions.filter(
            subtype="expenditure", created_at__range=[start_date, end_date]
        ).aggregate(total=Sum("amount"))["total"] or 0.00

        return {"total_income": total_income, "total_expenditure": total_expenditure}
    

    @staticmethod
    def compare_monthly_deposits_debits(user):
        """
        Compare monthly deposits and debits for a given user.
        Returns a dictionary with month-wise totals.
        """

        Transaction = apps.get_model('eWallet', 'Transaction')
        transactions = Transaction.objects.filter(account__user=user)

        monthly_data = (
            transactions.values("created_at__year", "created_at__month")
            .annotate(
                total_deposits=Sum("amount", filter=models.Q(transaction_type="deposit")),
                total_debits=Sum("amount", filter=models.Q(transaction_type="debit")),
            )
            .order_by("created_at__year", "created_at__month")
        )

        return [
            {
                "year": entry["created_at__year"],
                "month": entry["created_at__month"],
                "total_credits": entry["total_deposits"] or 0.00,
                "total_debits": entry["total_debits"] or 0.00,
            }
            for entry in monthly_data
        ]

