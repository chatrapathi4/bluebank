from django.urls import path
from . import views

urlpatterns = [
    path('', views.TransactionListView.as_view(), name='transaction_list'),
    path('<int:pk>/', views.TransactionDetailView.as_view(), name='transaction_detail'),
    path('transfer/', views.fund_transfer, name='fund_transfer'),
    path('history/', views.transaction_history, name='transaction_history'),
    path('summary/', views.transaction_summary, name='transaction_summary'),
]