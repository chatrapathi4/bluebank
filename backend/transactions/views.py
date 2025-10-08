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
            
            # Get source account
            from_account = transfer_transaction.from_account
            
            # Check if destination account exists in our system (internal transfer)
            try:
                to_account = Account.objects.get(
                    account_number=transfer_transaction.to_account_number,
                    status='ACTIVE'
                )
                is_internal_transfer = True
            except Account.DoesNotExist:
                to_account = None
                is_internal_transfer = False
            
            # Debit from source account
            from_account.balance -= transfer_transaction.amount
            from_account.save()
            
            # If internal transfer, credit to destination account
            if is_internal_transfer and to_account:
                to_account.balance += transfer_transaction.amount
                to_account.save()
                
                # Link the destination account in transaction
                transfer_transaction.to_account = to_account
                
                # Create a credit transaction record for the recipient
                Transaction.objects.create(
                    from_account=to_account,  # For accounting purposes
                    to_account=from_account,
                    to_account_number=from_account.account_number,
                    beneficiary_name=f"{from_account.user.first_name} {from_account.user.last_name}",
                    amount=transfer_transaction.amount,
                    transaction_type='DEPOSIT',
                    status='COMPLETED',
                    description=f"Credit from {from_account.account_number} - {transfer_transaction.description}",
                    reference_number=f"CR{transfer_transaction.reference_number}",
                    processed_at=timezone.now()
                )
            
            # Mark transaction as completed
            transfer_transaction.status = 'COMPLETED'
            transfer_transaction.processed_at = timezone.now()
            transfer_transaction.save()
            
            response_data = {
                'message': 'Transfer completed successfully',
                'transaction_id': str(transfer_transaction.transaction_id),
                'reference_number': transfer_transaction.reference_number,
                'amount': transfer_transaction.amount,
                'remaining_balance': from_account.balance,
                'transfer_type': 'Internal' if is_internal_transfer else 'External'
            }
            
            if is_internal_transfer and to_account:
                response_data['beneficiary_new_balance'] = to_account.balance
                response_data['beneficiary_account'] = to_account.account_number
            
            return Response(response_data, status=status.HTTP_201_CREATED)
    
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
    
    # Get both outgoing and incoming transactions
    outgoing_transactions = Transaction.objects.filter(
        from_account__in=user_accounts,
        created_at__gte=start_date
    ).exclude(transaction_type='DEPOSIT')
    
    incoming_transactions = Transaction.objects.filter(
        from_account__in=user_accounts,
        created_at__gte=start_date,
        transaction_type='DEPOSIT'
    )
    
    # Combine and sort transactions
    all_transactions = list(outgoing_transactions) + list(incoming_transactions)
    all_transactions.sort(key=lambda x: x.created_at, reverse=True)
    
    serializer = TransactionHistorySerializer(all_transactions, many=True)
    return Response({
        'transactions': serializer.data,
        'count': len(all_transactions)
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
