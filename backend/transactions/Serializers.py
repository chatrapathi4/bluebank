from rest_framework import serializers
from decimal import Decimal
from .models import Transaction
from accounts.models import Account

class TransactionSerializer(serializers.ModelSerializer):
    from_account_number = serializers.CharField(source='from_account.account_number', read_only=True)
    
    class Meta:
        model = Transaction
        fields = ['id', 'transaction_id', 'from_account', 'from_account_number', 
                 'to_account_number', 'to_ifsc_code', 'beneficiary_name', 
                 'amount', 'transaction_type', 'status', 'description', 
                 'reference_number', 'transaction_fee', 'created_at', 'processed_at']
        read_only_fields = ['transaction_id', 'reference_number', 'status', 
                           'transaction_fee', 'created_at', 'processed_at']

class FundTransferSerializer(serializers.ModelSerializer):
    from_account_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Transaction
        fields = ['from_account_id', 'to_account_number', 'to_ifsc_code', 
                 'beneficiary_name', 'amount', 'description']

    def validate_from_account_id(self, value):
        user = self.context['request'].user
        try:
            account = Account.objects.get(id=value, user=user, status='ACTIVE')
            return value
        except Account.DoesNotExist:
            raise serializers.ValidationError("Invalid account selected")

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than 0")
        if value > Decimal('1000000'):
            raise serializers.ValidationError("Amount exceeds transfer limit")
        return value

    def validate(self, attrs):
        from_account = Account.objects.get(id=attrs['from_account_id'])
        amount = attrs['amount']
        
        if from_account.balance < amount:
            raise serializers.ValidationError("Insufficient balance")
        
        return attrs

    def create(self, validated_data):
        from_account_id = validated_data.pop('from_account_id')
        from_account = Account.objects.get(id=from_account_id)
        
        transaction = Transaction.objects.create(
            from_account=from_account,
            transaction_type='TRANSFER',
            **validated_data
        )
        return transaction

class TransactionHistorySerializer(serializers.ModelSerializer):
    from_account_number = serializers.CharField(source='from_account.account_number', read_only=True)
    
    class Meta:
        model = Transaction
        fields = ['id', 'transaction_id', 'from_account_number', 'to_account_number', 
                 'beneficiary_name', 'amount', 'transaction_type', 'status', 
                 'description', 'reference_number', 'created_at', 'processed_at']