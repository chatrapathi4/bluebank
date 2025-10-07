from django.contrib import admin
from .models import Transaction

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('transaction_id', 'from_account', 'to_account_number', 'amount', 
                   'transaction_type', 'status', 'created_at')
    list_filter = ('transaction_type', 'status', 'created_at')
    search_fields = ('transaction_id', 'reference_number', 'from_account__account_number', 
                    'to_account_number', 'beneficiary_name')
    readonly_fields = ('transaction_id', 'reference_number', 'created_at', 'processed_at')
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Transaction Info', {
            'fields': ('transaction_id', 'reference_number', 'transaction_type', 'status')
        }),
        ('Account Details', {
            'fields': ('from_account', 'to_account', 'to_account_number', 'to_ifsc_code', 'beneficiary_name')
        }),
        ('Amount & Fees', {
            'fields': ('amount', 'transaction_fee', 'description')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'processed_at')
        }),
    )
