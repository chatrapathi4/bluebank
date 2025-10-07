from rest_framework import serializers
from .models import Account, Beneficiary

class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = ['id', 'account_number', 'account_type', 'balance', 'status', 
                 'branch_code', 'ifsc_code', 'created_at']
        read_only_fields = ['account_number', 'balance', 'created_at']

class BeneficiarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Beneficiary
        fields = ['id', 'beneficiary_name', 'account_number', 'ifsc_code', 
                 'bank_name', 'nickname', 'is_verified', 'created_at']
        read_only_fields = ['is_verified', 'created_at']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class AccountSummarySerializer(serializers.Serializer):
    total_accounts = serializers.IntegerField()
    total_balance = serializers.DecimalField(max_digits=15, decimal_places=2)
    accounts = AccountSerializer(many=True)