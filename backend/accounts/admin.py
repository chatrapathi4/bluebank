from django.contrib import admin
from .models import Account, Beneficiary

@admin.register(Account)
class AccountAdmin(admin.ModelAdmin):
    list_display = ('account_number', 'user', 'account_type', 'balance', 'status', 'created_at')
    list_filter = ('account_type', 'status', 'created_at')
    search_fields = ('account_number', 'user__username', 'user__email')
    readonly_fields = ('account_number', 'created_at', 'updated_at')

@admin.register(Beneficiary)
class BeneficiaryAdmin(admin.ModelAdmin):
    list_display = ('beneficiary_name', 'account_number', 'bank_name', 'user', 'is_verified', 'created_at')
    list_filter = ('is_verified', 'bank_name', 'created_at')
    search_fields = ('beneficiary_name', 'account_number', 'user__username')
    readonly_fields = ('created_at',)
