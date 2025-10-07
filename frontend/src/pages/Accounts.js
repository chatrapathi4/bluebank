import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  CircularProgress,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  AccountBalance,
  Add,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Accounts = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState([]);
  const [showBalance, setShowBalance] = useState({});

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await axios.get('/api/accounts/summary/');
      setAccounts(response.data.accounts || []);
    } catch (error) {
      console.error('Error fetching accounts:', error);
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

  const toggleBalanceVisibility = (accountId) => {
    setShowBalance(prev => ({
      ...prev,
      [accountId]: !prev[accountId]
    }));
  };

  const getAccountTypeColor = (type) => {
    switch (type) {
      case 'SAVINGS': return 'primary';
      case 'CURRENT': return 'secondary';
      case 'FIXED': return 'success';
      default: return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'INACTIVE': return 'warning';
      case 'FROZEN': return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" gutterBottom>
          My Accounts
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => alert('Contact bank to open new account')}
        >
          Open New Account
        </Button>
      </Box>

      {/* Accounts Grid */}
      <Grid container spacing={3}>
        {accounts.map((account) => (
          <Grid item xs={12} md={6} lg={4} key={account.id}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                {/* Account Type & Status */}
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Chip 
                    label={account.account_type} 
                    color={getAccountTypeColor(account.account_type)}
                    size="small"
                  />
                  <Chip 
                    label={account.status} 
                    color={getStatusColor(account.status)}
                    size="small"
                  />
                </Box>

                {/* Account Number */}
                <Typography variant="h6" gutterBottom>
                  Account No: {account.account_number}
                </Typography>

                {/* Balance */}
                <Box display="flex" alignItems="center" mb={2}>
                  <Typography variant="h4" component="div" sx={{ flexGrow: 1 }}>
                    {showBalance[account.id] 
                      ? formatCurrency(account.balance)
                      : '₹ ••••••••'
                    }
                  </Typography>
                  <Button
                    size="small"
                    onClick={() => toggleBalanceVisibility(account.id)}
                    startIcon={showBalance[account.id] ? <VisibilityOff /> : <Visibility />}
                  >
                    {showBalance[account.id] ? 'Hide' : 'Show'}
                  </Button>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Account Details */}
                <List dense>
                  <ListItem disablePadding>
                    <ListItemText 
                      primary="IFSC Code" 
                      secondary={account.ifsc_code}
                    />
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemText 
                      primary="Branch Code" 
                      secondary={account.branch_code}
                    />
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemText 
                      primary="Opened On" 
                      secondary={new Date(account.created_at).toLocaleDateString()}
                    />
                  </ListItem>
                </List>

                {/* Action Buttons */}
                <Box mt={2}>
                  <Button 
                    fullWidth 
                    variant="outlined" 
                    sx={{ mb: 1 }}
                    onClick={() => navigate('/transactions')}
                  >
                    View Transactions
                  </Button>
                  <Button 
                    fullWidth 
                    variant="contained"
                    onClick={() => navigate('/transfer', { state: { fromAccount: account } })}
                  >
                    Transfer Money
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {/* No Accounts Message */}
        {accounts.length === 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 8 }}>
                <AccountBalance sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  No Accounts Found
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  You don't have any bank accounts yet. Contact the bank to open your first account.
                </Typography>
                <Button 
                  variant="contained" 
                  size="large"
                  onClick={() => alert('Please visit branch or contact customer service to open an account')}
                >
                  Contact Bank
                </Button>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default Accounts;