from django.db import models
from django.conf import settings
import uuid
import random

class Account(models.Model):
    ACCOUNT_TYPES = [
        ('SAVINGS', 'Savings Account'),
        ('CURRENT', 'Current Account'),
        ('FIXED', 'Fixed Deposit'),
    ]
    
    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('INACTIVE', 'Inactive'),
        ('FROZEN', 'Frozen'),
    ]

    account_number = models.CharField(max_length=20, unique=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='accounts')
    account_type = models.CharField(max_length=10, choices=ACCOUNT_TYPES, default='SAVINGS')
    balance = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='ACTIVE')
    branch_code = models.CharField(max_length=10, default='BLUE001')
    ifsc_code = models.CharField(max_length=11, default='BLUE0000001')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.account_number} - {self.user.get_full_name()}"

    def save(self, *args, **kwargs):
        if not self.account_number:
            self.account_number = self.generate_account_number()
        super().save(*args, **kwargs)

    def generate_account_number(self):
        # Generate a 12-digit account number starting with 50100
        return f"50100{random.randint(1000000, 9999999)}"

    class Meta:
        db_table = 'accounts_account'
        verbose_name = 'Account'
        verbose_name_plural = 'Accounts'

class Beneficiary(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='beneficiaries')
    beneficiary_name = models.CharField(max_length=100)
    account_number = models.CharField(max_length=20)
    ifsc_code = models.CharField(max_length=11)
    bank_name = models.CharField(max_length=100)
    nickname = models.CharField(max_length=50, blank=True)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'account_number']
        db_table = 'accounts_beneficiary'
        verbose_name = 'Beneficiary'
        verbose_name_plural = 'Beneficiaries'

    def __str__(self):
        return f"{self.beneficiary_name} - {self.account_number}"
