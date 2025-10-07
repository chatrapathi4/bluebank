from django.urls import path
from . import views

urlpatterns = [
    path('', views.AccountListView.as_view(), name='account_list'),
    path('<int:pk>/', views.AccountDetailView.as_view(), name='account_detail'),
    path('summary/', views.account_summary, name='account_summary'),
    path('beneficiaries/', views.BeneficiaryListView.as_view(), name='beneficiary_list'),
    path('beneficiaries/<int:pk>/', views.BeneficiaryDetailView.as_view(), name='beneficiary_detail'),
]