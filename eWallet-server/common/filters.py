from datetime import timedelta
from django.utils.timezone import now
from django.db.models import Sum, Q
from django.apps import apps


def filter_transactions_by_duration(user, duration):
    """
    Filters transactions for a user based on the selected duration.
    Returns aggregated deposit and debit amounts grouped by year and month.
    """

    if duration == "today":
        start_date = now().date()
    elif duration == "this_week":
        start_date = now().date() - timedelta(days=now().weekday())  
    elif duration == "last_week":
        start_date = now().date() - timedelta(days=now().weekday() + 7)  
    elif duration == "this_month":
        start_date = now().replace(day=1).date()  
    elif duration == "last_month":
        first_day_of_this_month = now().replace(day=1)
        start_date = (first_day_of_this_month - timedelta(days=1)).replace(day=1).date()  
    else:
        start_date = None 

    Transaction = apps.get_model("eWallet", "Transaction")

    transactions = Transaction.objects.filter(account__user=user)

    if start_date:
        transactions = transactions.filter(created_at__date__gte=start_date)

    monthly_data = (
        transactions.values("created_at__year", "created_at__month")
        .annotate(
            total_deposits=Sum("amount", filter=Q(transaction_type="deposit")),
            total_debits=Sum("amount", filter=Q(transaction_type="debit")),
        )
        .order_by("created_at__year", "created_at__month")
    )

    return [
        {
            "year": entry["created_at__year"],
            "month": entry["created_at__month"],
            "total_deposits": entry["total_deposits"] or 0.00,
            "total_debits": entry["total_debits"] or 0.00,
        }
        for entry in monthly_data
    ]
