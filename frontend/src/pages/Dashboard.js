import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  CircularProgress,
  Chip,
  Paper,
  MenuItem,
  TextField,
} from '@mui/material';
import {
  AccountBalance,
  TrendingUp,
  TrendingDown,
  Send,
  Receipt,
  Person,
  CreditCard,
  History,
  Add,
  Visibility,
  VisibilityOff,
  AccountBalanceWallet,
  AttachMoney,
  Payment,
  Savings,
  TrendingUpOutlined,
  MonetizationOn,
  LocalOffer,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    accounts: [],
    recentTransactions: [],
    totalBalance: 0,
    totalSentThisWeek: 0,
    pendingTransactions: 0,
    totalTransactions: 0
  });
  const [showBalances, setShowBalances] = useState({});
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [primaryAccountBalance, setPrimaryAccountBalance] = useState(0);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (selectedAccountId && dashboardData.accounts.length > 0) {
      const selectedAccount = dashboardData.accounts.find(acc => acc.id === parseInt(selectedAccountId));
      setPrimaryAccountBalance(selectedAccount ? selectedAccount.balance : 0);
    } else if (dashboardData.accounts.length > 0 && !selectedAccountId) {
      const firstAccount = dashboardData.accounts[0];
      setSelectedAccountId(firstAccount.id.toString());
      setPrimaryAccountBalance(firstAccount.balance);
    }
  }, [selectedAccountId, dashboardData.accounts]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const accountsResponse = await axios.get('/api/accounts/summary/');
      const transactionsResponse = await axios.get('/api/transactions/summary/');
      
      const accounts = accountsResponse.data.accounts || [];
      
      setDashboardData({
        accounts: accounts,
        recentTransactions: transactionsResponse.data.recent_transactions || [],
        totalBalance: accountsResponse.data.total_balance || 0,
        totalSentThisWeek: transactionsResponse.data.total_sent_this_week || 0,
        pendingTransactions: transactionsResponse.data.pending_transactions || 0,
        totalTransactions: transactionsResponse.data.total_transactions || 0
      });
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const toggleBalanceVisibility = (accountId) => {
    setShowBalances(prev => ({
      ...prev,
      [accountId]: !prev[accountId]
    }));
  };

  const handleAccountChange = (event) => {
    setSelectedAccountId(event.target.value);
  };

  const getSelectedAccountInfo = () => {
    if (selectedAccountId && dashboardData.accounts.length > 0) {
      return dashboardData.accounts.find(acc => acc.id === parseInt(selectedAccountId));
    }
    return dashboardData.accounts[0] || null;
  };

  const getTransactionIcon = (transaction) => {
    return transaction.transaction_type === 'DEPOSIT' ? <TrendingUp color="success" /> : <TrendingDown color="error" />;
  };

  const getTransactionColor = (transaction) => {
    return transaction.transaction_type === 'DEPOSIT' ? 'success.main' : 'error.main';
  };

  const quickActions = [
    {
      title: 'Transfer Money',
      description: 'Send money to any account',
      icon: <Send />,
      color: 'primary',
      action: () => navigate('/transfer')
    },
    {
      title: 'View Accounts',
      description: 'Manage your accounts',
      icon: <AccountBalance />,
      color: 'secondary',
      action: () => navigate('/accounts')
    },
    {
      title: 'Transaction History',
      description: 'View all transactions',
      icon: <History />,
      color: 'info',
      action: () => navigate('/transactions')
    },
    {
      title: 'Profile Settings',
      description: 'Update your profile',
      icon: <Person />,
      color: 'warning',
      action: () => navigate('/profile')
    }
  ];

  // Banking Services data
  const bankingServices = [
    {
      title: 'Pay',
      description: 'Bills, recharges, and instant payments',
      icon: <Payment />,
      gradient: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #60a5fa 100%)',
      shadowColor: 'rgba(59, 130, 246, 0.3)',
      action: () => alert('Payment services feature coming soon!')
    },
    {
      title: 'Save',
      description: 'Fixed deposits and savings plans',
      icon: <Savings />,
      gradient: 'linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%)',
      shadowColor: 'rgba(16, 185, 129, 0.3)',
      action: () => alert('Savings products feature coming soon!')
    },
    {
      title: 'Invest',
      description: 'Mutual funds and investment options',
      icon: <TrendingUpOutlined />,
      gradient: 'linear-gradient(135deg, #7c2d12 0%, #ea580c 50%, #fb923c 100%)',
      shadowColor: 'rgba(234, 88, 12, 0.3)',
      action: () => alert('Investment services feature coming soon!')
    },
    {
      title: 'Borrow',
      description: 'Personal, home, and vehicle loans',
      icon: <MonetizationOn />,
      gradient: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #c084fc 100%)',
      shadowColor: 'rgba(168, 85, 247, 0.3)',
      action: () => alert('Loan services feature coming soon!')
    },
    {
      title: 'Offers',
      description: 'Exclusive deals and cashback offers',
      icon: <LocalOffer />,
      gradient: 'linear-gradient(135deg, #dc2626 0%, #ef4444 50%, #f87171 100%)',
      shadowColor: 'rgba(239, 68, 68, 0.3)',
      action: () => alert('Special offers feature coming soon!')
    }
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress size={50} />
      </Box>
    );
  }

  const selectedAccount = getSelectedAccountInfo();

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Welcome Section */}
      <Paper 
        sx={{ 
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          color: 'white',
          p: 4,
          mb: 4,
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Welcome back, {user?.first_name || user?.username}! 👋
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Here's your banking overview for today
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>
              {new Date().toLocaleDateString('en-IN', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Typography>
          </Box>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: 'rgba(255,255,255,0.15)',
              fontSize: '2rem',
              display: { xs: 'none', md: 'flex' },
              border: '2px solid rgba(255,255,255,0.2)'
            }}
          >
            {user?.first_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
          </Avatar>
        </Box>
      </Paper>

      {/* Banking Services Section */}
      <Card sx={{ mb: 4, borderRadius: 2, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)' }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
            Banking Services
          </Typography>
          <Grid container spacing={2}>
            {bankingServices.map((service, index) => (
              <Grid item xs={12} sm={6} md={2.4} key={index}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    background: service.gradient,
                    color: 'white',
                    height: 140,
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: `0 4px 20px ${service.shadowColor}`,
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: `0 8px 30px ${service.shadowColor}`
                    }
                  }}
                  onClick={service.action}
                >
                  <CardContent sx={{ 
                    textAlign: 'center', 
                    py: 2,
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                  }}>
                    <Box sx={{ mb: 1 }}>
                      {service.icon}
                    </Box>
                    <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ fontSize: '1rem' }}>
                      {service.title}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.9, fontSize: '0.75rem', lineHeight: 1.2 }}>
                      {service.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Account Selector */}
      {dashboardData.accounts.length > 1 && (
        <Card sx={{ mb: 3, borderRadius: 2, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Select Primary Account
            </Typography>
            <TextField
              select
              fullWidth
              label="Primary Account"
              value={selectedAccountId}
              onChange={handleAccountChange}
              helperText="Balance shown below is for the selected account"
            >
              {dashboardData.accounts.map((account) => (
                <MenuItem key={account.id} value={account.id.toString()}>
                  {account.account_number} - {account.account_type} 
                  ({formatCurrency(account.balance)})
                </MenuItem>
              ))}
            </TextField>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Summary Cards with Dark Themes */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Balance Card - Dark Green/Teal */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: '100%',
            minHeight: 160,
            background: 'linear-gradient(135deg, #0d7377 0%, #14a085 50%, #2dd4bf 100%)',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(13, 115, 119, 0.3)',
            transition: 'transform 0.3s ease',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: '0 12px 40px rgba(13, 115, 119, 0.4)'
            }
          }}>
            <Box 
              sx={{
                position: 'absolute',
                top: -50,
                right: -50,
                width: 100,
                height: 100,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.1)',
              }}
            />
            <CardContent sx={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column',
              justifyContent: 'space-between',
              p: 3,
              position: 'relative',
              zIndex: 1
            }}>
              <Box display="flex" alignItems="flex-start" justifyContent="space-between">
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1, fontSize: '0.9rem' }}>
                    {selectedAccount ? `${selectedAccount.account_type} Balance` : 'Account Balance'}
                  </Typography>
                  <Typography variant="h4" fontWeight="700" sx={{ mb: 1, letterSpacing: '-0.5px' }}>
                    {formatCurrency(primaryAccountBalance)}
                  </Typography>
                  {selectedAccount && (
                    <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.75rem' }}>
                      A/C: ••••{selectedAccount.account_number.slice(-4)}
                    </Typography>
                  )}
                </Box>
                <AccountBalance sx={{ fontSize: 40, opacity: 0.9 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Accounts Card - Dark Purple */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: '100%',
            minHeight: 160,
            background: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 50%, #a855f7 100%)',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(124, 58, 237, 0.3)',
            transition: 'transform 0.3s ease',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: '0 12px 40px rgba(124, 58, 237, 0.4)'
            }
          }}>
            <Box 
              sx={{
                position: 'absolute',
                top: -30,
                right: -30,
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.1)',
              }}
            />
            <CardContent sx={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column',
              justifyContent: 'space-between',
              p: 3,
              position: 'relative',
              zIndex: 1
            }}>
              <Box display="flex" alignItems="flex-start" justifyContent="space-between">
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1, fontSize: '0.9rem' }}>
                    Total Accounts
                  </Typography>
                  <Typography variant="h4" fontWeight="700" sx={{ mb: 1, letterSpacing: '-0.5px' }}>
                    {dashboardData.accounts.length}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.75rem' }}>
                    Combined: {formatCurrency(dashboardData.totalBalance)}
                  </Typography>
                </Box>
                <CreditCard sx={{ fontSize: 40, opacity: 0.9 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* This Week Sent Card - Dark Blue */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: '100%',
            minHeight: 160,
            background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #60a5fa 100%)',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(59, 130, 246, 0.3)',
            transition: 'transform 0.3s ease',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: '0 12px 40px rgba(59, 130, 246, 0.4)'
            }
          }}>
            <Box 
              sx={{
                position: 'absolute',
                bottom: -40,
                left: -40,
                width: 90,
                height: 90,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.08)',
              }}
            />
            <CardContent sx={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column',
              justifyContent: 'space-between',
              p: 3,
              position: 'relative',
              zIndex: 1
            }}>
              <Box display="flex" alignItems="flex-start" justifyContent="space-between">
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1, fontSize: '0.9rem' }}>
                    This Week Sent
                  </Typography>
                  <Typography variant="h4" fontWeight="700" sx={{ mb: 1, letterSpacing: '-0.5px' }}>
                    {formatCurrency(dashboardData.totalSentThisWeek)}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.75rem' }}>
                    Total Transfers
                  </Typography>
                </Box>
                <TrendingUp sx={{ fontSize: 40, opacity: 0.9 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Pending Transactions Card - Dark Red/Orange */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: '100%',
            minHeight: 160,
            background: 'linear-gradient(135deg, #991b1b 0%, #dc2626 50%, #f87171 100%)',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(220, 38, 38, 0.3)',
            transition: 'transform 0.3s ease',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: '0 12px 40px rgba(220, 38, 38, 0.4)'
            }
          }}>
            <Box 
              sx={{
                position: 'absolute',
                top: -20,
                left: -20,
                width: 70,
                height: 70,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.1)',
              }}
            />
            <CardContent sx={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column',
              justifyContent: 'space-between',
              p: 3,
              position: 'relative',
              zIndex: 1
            }}>
              <Box display="flex" alignItems="flex-start" justifyContent="space-between">
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1, fontSize: '0.9rem' }}>
                    Pending Transactions
                  </Typography>
                  <Typography variant="h4" fontWeight="700" sx={{ mb: 1, letterSpacing: '-0.5px' }}>
                    {dashboardData.pendingTransactions}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.75rem' }}>
                    Processing
                  </Typography>
                </Box>
                <Receipt sx={{ fontSize: 40, opacity: 0.9 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Accounts Overview */}
        <Grid item xs={12} md={8}>
          <Card sx={{ 
            height: 'fit-content',
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(0, 0, 0, 0.05)'
          }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6" fontWeight="bold" color="text.primary">
                  My Accounts
                </Typography>
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={() => navigate('/accounts')}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600
                  }}
                >
                  View All
                </Button>
              </Box>

              {dashboardData.accounts.length > 0 ? (
                <List>
                  {dashboardData.accounts.map((account, index) => (
                    <React.Fragment key={account.id}>
                      <ListItem 
                        sx={{ 
                          px: 0,
                          backgroundColor: selectedAccountId === account.id.toString() ? 'rgba(0, 61, 130, 0.08)' : 'transparent',
                          borderRadius: 2,
                          mb: 1,
                          border: selectedAccountId === account.id.toString() ? '1px solid rgba(0, 61, 130, 0.2)' : '1px solid transparent'
                        }}
                      >
                        <ListItemIcon>
                          <AccountBalance color={selectedAccountId === account.id.toString() ? 'primary' : 'inherit'} />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Box>
                                <Typography variant="subtitle1" fontWeight="bold">
                                  {account.account_type} Account
                                  {selectedAccountId === account.id.toString() && (
                                    <Chip 
                                      label="Primary" 
                                      size="small" 
                                      color="primary" 
                                      sx={{ ml: 1, borderRadius: 1 }}
                                    />
                                  )}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  ••••••••{account.account_number.slice(-4)}
                                </Typography>
                              </Box>
                              <Box textAlign="right">
                                <Box display="flex" alignItems="center">
                                  <Typography variant="h6" fontWeight="bold" sx={{ mr: 1 }}>
                                    {showBalances[account.id] 
                                      ? formatCurrency(account.balance)
                                      : '₹ ••••••••'
                                    }
                                  </Typography>
                                  <Button
                                    size="small"
                                    onClick={() => toggleBalanceVisibility(account.id)}
                                    sx={{ minWidth: 'auto', p: 1 }}
                                  >
                                    {showBalances[account.id] ? <VisibilityOff /> : <Visibility />}
                                  </Button>
                                </Box>
                                <Chip 
                                  label={account.status} 
                                  color={account.status === 'ACTIVE' ? 'success' : 'default'}
                                  size="small"
                                  sx={{ borderRadius: 1 }}
                                />
                              </Box>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < dashboardData.accounts.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Box textAlign="center" py={4}>
                  <AccountBalance sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No Accounts Found
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Contact the bank to open your first account
                  </Typography>
                  <Button variant="contained" startIcon={<Add />} sx={{ borderRadius: 2 }}>
                    Contact Bank
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions and Recent Transactions */}
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            mb: 3, 
            height: 'fit-content',
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(0, 0, 0, 0.05)'
          }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Quick Actions
              </Typography>
              <Grid container spacing={2}>
                {quickActions.map((action, index) => (
                  <Grid item xs={6} key={index}>
                    <Card 
                      sx={{ 
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        height: 110,
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                        border: '1px solid rgba(0, 0, 0, 0.08)',
                        '&:hover': {
                          transform: 'translateY(-3px)',
                          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
                        }
                      }}
                      onClick={action.action}
                    >
                      <CardContent sx={{ 
                        textAlign: 'center', 
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        p: 2
                      }}>
                        <Box sx={{ color: `${action.color}.main`, mb: 1.5 }}>
                          {action.icon}
                        </Box>
                        <Typography variant="caption" fontWeight="bold" color="text.primary">
                          {action.title}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card sx={{ 
            height: 'fit-content',
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(0, 0, 0, 0.05)'
          }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight="bold">
                  Recent Transactions
                </Typography>
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={() => navigate('/transactions')}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600
                  }}
                >
                  View All
                </Button>
              </Box>

              {dashboardData.recentTransactions.length > 0 ? (
                <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                  {dashboardData.recentTransactions.slice(0, 5).map((transaction, index) => (
                    <React.Fragment key={transaction.id}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon>
                          {getTransactionIcon(transaction)}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="body2" fontWeight="bold">
                              {transaction.transaction_type === 'DEPOSIT' ? 'Credit' : 'Debit'}
                            </Typography>
                          }
                          secondary={
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                {transaction.beneficiary_name}
                              </Typography>
                              <Typography variant="caption" display="block" color="text.secondary">
                                {formatDateTime(transaction.created_at)}
                              </Typography>
                            </Box>
                          }
                        />
                        <Typography 
                          variant="body2" 
                          fontWeight="bold"
                          color={getTransactionColor(transaction)}
                        >
                          {transaction.transaction_type === 'DEPOSIT' ? '+' : '-'}
                          {formatCurrency(transaction.amount)}
                        </Typography>
                      </ListItem>
                      {index < Math.min(dashboardData.recentTransactions.length, 5) - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Box textAlign="center" py={3}>
                  <Receipt sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    No recent transactions
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;