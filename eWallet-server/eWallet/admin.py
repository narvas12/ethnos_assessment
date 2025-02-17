from django.contrib import admin

from eWallet.models import Account, CustomUser

# Register your models here.
@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ['id', 'full_name', 'email', 'phone_number', 'is_verified', 'is_blocked']
    search_fields = ['full_name', 'email', 'phone_number']
    list_filter = ['is_verified', 'is_blocked']
    ordering = ['id']

@admin.register(Account)
class AccountAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'account_name', 'account_number', 'balance']
    search_fields = ['account_name', 'account_number', 'balance']
    list_filter = ['account_name']
    ordering = ['id']