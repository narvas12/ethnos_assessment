from django.urls import path
from .views import (CardAPIView, CompareMonthlyDepositsDebitsAPIView, CreditTransactionAPIView, 
                    CustomUserAPIView, DebitTransactionAPIView, GetAuthenticatedUserAPIView, 
                    IncomeExpenditureAPIView, IncomeExpenditureByDateAPIView, LoginAPIView, 
                    ScanQRCodeView, SendMoneyViaQRView, UserAccountDetailView, FundCardView, 
                    UserQRCodeAPIView, UserTransactionsAPIView, PayCustomerAPIView)
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('users/', CustomUserAPIView.as_view()),
    path('users/<int:user_id>/', CustomUserAPIView.as_view()),

    path("users/me/", GetAuthenticatedUserAPIView.as_view()),

    path('login/', LoginAPIView.as_view(), name='login'),
    path('refresh/', TokenRefreshView.as_view()),

    path("account/", UserAccountDetailView.as_view()),

    path("card/", CardAPIView.as_view()),
    path("card/fund/", FundCardView.as_view()),

    path("transactions/debit/", DebitTransactionAPIView.as_view()),
    path("transactions/debit/<uuid:transaction_id>/", DebitTransactionAPIView.as_view()),

    path("transactions/credit/", CreditTransactionAPIView.as_view()),
    path("transactions/credit/<uuid:transaction_id>/", CreditTransactionAPIView.as_view()),

    path("qr-code/", UserQRCodeAPIView.as_view(), name="user-qr-code"),
    path("scan-qr-code/", ScanQRCodeView.as_view()),
    path("send-money-via-qr/", SendMoneyViaQRView.as_view()),

    path("transactions/", UserTransactionsAPIView.as_view(), name="user-transactions"),

    path("transactions/income-expenditure/", IncomeExpenditureAPIView.as_view()),
    path("transactions/income-expenditure-by-date/", IncomeExpenditureByDateAPIView.as_view()),

    path("transactions/monthly-comparison/", CompareMonthlyDepositsDebitsAPIView.as_view()),

    path("pay-customer/<str:customer_id>", PayCustomerAPIView.as_view()),

]

