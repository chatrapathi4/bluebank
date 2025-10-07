from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Account, Beneficiary
from .Serializers import AccountSerializer, BeneficiarySerializer, AccountSummarySerializer

class AccountListView(generics.ListCreateAPIView):
    serializer_class = AccountSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Account.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class AccountDetailView(generics.RetrieveAPIView):
    serializer_class = AccountSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Account.objects.filter(user=self.request.user)

class BeneficiaryListView(generics.ListCreateAPIView):
    serializer_class = BeneficiarySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Beneficiary.objects.filter(user=self.request.user)

class BeneficiaryDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = BeneficiarySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Beneficiary.objects.filter(user=self.request.user)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def account_summary(request):
    accounts = Account.objects.filter(user=request.user)
    total_balance = sum(account.balance for account in accounts)
    
    data = {
        'total_accounts': accounts.count(),
        'total_balance': total_balance,
        'accounts': AccountSerializer(accounts, many=True).data
    }
    
    return Response(data)
