from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db import transaction
from django.utils import timezone
from .models import Transaction
from .Serializers import TransactionSerializer, FundTransferSerializer, TransactionHistorySerializer
from accounts.models import Account

class TransactionListView(generics.ListAPIView):
    serializer_class = TransactionHistorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user_accounts = Account.objects.filter(user=self.request.user)
        return Transaction.objects.filter(from_account__in=user_accounts)

class TransactionDetailView(generics.RetrieveAPIView):
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user_accounts = Account.objects.filter(user=self.request.user)
        return Transaction.objects.filter(from_account__in=user_accounts)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def fund_transfer(request):
    """Process fund transfer between accounts"""
    serializer = FundTransferSerializer(data=request.data, context={'request': request})
    
    if serializer.is_valid():
        with transaction.atomic():
            # Create transaction record
            transfer_transaction = serializer.save()
            
            # Update account balance
            from_account = transfer_transaction.from_account
            from_account.balance -= transfer_transaction.amount
            from_account.save()
            
            # Mark transaction as completed
            transfer_transaction.status = 'COMPLETED'
            transfer_transaction.processed_at = timezone.now()
            transfer_transaction.save()
            
            return Response({
                'message': 'Transfer completed successfully',
                'transaction_id': str(transfer_transaction.transaction_id),
                'reference_number': transfer_transaction.reference_number,
                'amount': transfer_transaction.amount,
                'remaining_balance': from_account.balance
            }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def transaction_history(request):
    """Get transaction history for user's accounts"""
    account_id = request.query_params.get('account_id')
    days = int(request.query_params.get('days', 30))
    
    user_accounts = Account.objects.filter(user=request.user)
    
    if account_id:
        user_accounts = user_accounts.filter(id=account_id)
    
    from datetime import timedelta
    start_date = timezone.now() - timedelta(days=days)
    
    transactions = Transaction.objects.filter(
        from_account__in=user_accounts,
        created_at__gte=start_date
    )
    
    serializer = TransactionHistorySerializer(transactions, many=True)
    return Response({
        'transactions': serializer.data,
        'count': transactions.count()
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def transaction_summary(request):
    """Get transaction summary for dashboard"""
    user_accounts = Account.objects.filter(user=request.user)
    
    # Get recent transactions (last 7 days)
    from datetime import timedelta
    recent_date = timezone.now() - timedelta(days=7)
    
    recent_transactions = Transaction.objects.filter(
        from_account__in=user_accounts,
        created_at__gte=recent_date
    )
    
    # Calculate totals
    total_sent = sum(t.amount for t in recent_transactions if t.status == 'COMPLETED')
    pending_transactions = recent_transactions.filter(status='PENDING').count()
    
    return Response({
        'recent_transactions': TransactionHistorySerializer(recent_transactions[:5], many=True).data,
        'total_sent_this_week': total_sent,
        'pending_transactions': pending_transactions,
        'total_transactions': recent_transactions.count()
    })
