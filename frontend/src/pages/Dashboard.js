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
          background: 'linear-gradient(135deg, #003d82 0%, #4a6fa5 100%)',
          color: 'white',
          p: 4,
          mb: 4,
          borderRadius: 3
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
              bgcolor: 'rgba(255,255,255,0.2)',
              fontSize: '2rem',
              display: { xs: 'none', md: 'flex' }
            }}
          >
            {user?.first_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
          </Avatar>
        </Box>
      </Paper>

      {/* Account Selector */}
      {dashboardData.accounts.length > 1 && (
        <Card sx={{ mb: 3 }}>
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

      {/* Summary Cards - All Same Height */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: '100%',
            minHeight: 140,
            background: 'linear-gradient(135deg, #4caf50 0%, #81c784 100%)', 
            color: 'white',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <CardContent sx={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column',
              justifyContent: 'space-between',
              p: 2
            }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    {selectedAccount ? `${selectedAccount.account_type} Balance` : 'Account Balance'}
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>
                    {formatCurrency(primaryAccountBalance)}
                  </Typography>
                  {selectedAccount && (
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      A/C: {selectedAccount.account_number}
                    </Typography>
                  )}
                </Box>
                <AccountBalance sx={{ fontSize: 35, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: '100%',
            minHeight: 140,
            background: 'linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)', 
            color: 'white',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <CardContent sx={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column',
              justifyContent: 'space-between',
              p: 2
            }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Total Accounts
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>
                    {dashboardData.accounts.length}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    Combined: {formatCurrency(dashboardData.totalBalance)}
                  </Typography>
                </Box>
                <CreditCard sx={{ fontSize: 35, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: '100%',
            minHeight: 140,
            background: 'linear-gradient(135deg, #2196f3 0%, #64b5f6 100%)', 
            color: 'white',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <CardContent sx={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column',
              justifyContent: 'space-between',
              p: 2
            }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    This Week Sent
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>
                    {formatCurrency(dashboardData.totalSentThisWeek)}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    Total Transfers
                  </Typography>
                </Box>
                <TrendingUp sx={{ fontSize: 35, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: '100%',
            minHeight: 140,
            background: 'linear-gradient(135deg, #f44336 0%, #ef5350 100%)', 
            color: 'white',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <CardContent sx={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column',
              justifyContent: 'space-between',
              p: 2
            }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Pending Transactions
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>
                    {dashboardData.pendingTransactions}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    Processing
                  </Typography>
                </Box>
                <Receipt sx={{ fontSize: 35, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Accounts Overview */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: 'fit-content' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6" fontWeight="bold">
                  My Accounts
                </Typography>
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={() => navigate('/accounts')}
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
                          backgroundColor: selectedAccountId === account.id.toString() ? 'rgba(0, 61, 130, 0.1)' : 'transparent',
                          borderRadius: 1,
                          mb: 1
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
                                      sx={{ ml: 1 }}
                                    />
                                  )}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {account.account_number}
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
                                  >
                                    {showBalances[account.id] ? <VisibilityOff /> : <Visibility />}
                                  </Button>
                                </Box>
                                <Chip 
                                  label={account.status} 
                                  color={account.status === 'ACTIVE' ? 'success' : 'default'}
                                  size="small"
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
                  <Button variant="contained" startIcon={<Add />}>
                    Contact Bank
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3, height: 'fit-content' }}>
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
                        transition: 'transform 0.2s',
                        height: 100,
                        display: 'flex',
                        flexDirection: 'column',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: 3
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
                        p: 1
                      }}>
                        <Box sx={{ color: `${action.color}.main`, mb: 1 }}>
                          {action.icon}
                        </Box>
                        <Typography variant="caption" fontWeight="bold">
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
          <Card sx={{ height: 'fit-content' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight="bold">
                  Recent Transactions
                </Typography>
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={() => navigate('/transactions')}
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