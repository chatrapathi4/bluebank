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
  TextField,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  Divider,
  Pagination,
} from '@mui/material';
import {
  FilterList,
  Download,
  Search,
  TrendingUp,
  TrendingDown,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Transactions = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    status: 'ALL',
    days: 30,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchTransactions();
  }, [filters.days]);

  useEffect(() => {
    applyFilters();
  }, [transactions, filters.search, filters.status]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/transactions/history/?days=${filters.days}`);
      setTransactions(response.data.transactions || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = transactions;

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(transaction => 
        transaction.beneficiary_name?.toLowerCase().includes(filters.search.toLowerCase()) ||
        transaction.to_account_number?.includes(filters.search) ||
        transaction.transaction_id?.toLowerCase().includes(filters.search.toLowerCase()) ||
        transaction.reference_number?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Status filter
    if (filters.status !== 'ALL') {
      filtered = filtered.filter(transaction => transaction.status === filters.status);
    }

    setFilteredTransactions(filtered);
    setCurrentPage(1);
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return 'success';
      case 'PENDING': return 'warning';
      case 'FAILED': return 'error';
      case 'CANCELLED': return 'default';
      default: return 'default';
    }
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Determine if transaction is credit or debit
  const getTransactionDirection = (transaction) => {
    // If transaction type is DEPOSIT, it's a credit
    if (transaction.transaction_type === 'DEPOSIT') {
      return 'CREDIT';
    }
    // Otherwise, it's a debit (TRANSFER, WITHDRAWAL, etc.)
    return 'DEBIT';
  };

  const getTransactionIcon = (direction) => {
    return direction === 'CREDIT' ? <TrendingUp /> : <TrendingDown />;
  };

  const getTransactionColor = (direction) => {
    return direction === 'CREDIT' ? 'success.main' : 'error.main';
  };

  const getTransactionPrefix = (direction) => {
    return direction === 'CREDIT' ? '+' : '-';
  };

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
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
          Transaction History
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Download />}
          onClick={() => alert('Download feature will be implemented soon')}
        >
          Download Statement
        </Button>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <FilterList sx={{ mr: 1, verticalAlign: 'middle' }} />
            Filters
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Search"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Search by beneficiary, account, transaction ID..."
                InputProps={{
                  startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                select
                fullWidth
                label="Status"
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
              >
                <MenuItem value="ALL">All Status</MenuItem>
                <MenuItem value="COMPLETED">Completed</MenuItem>
                <MenuItem value="PENDING">Pending</MenuItem>
                <MenuItem value="FAILED">Failed</MenuItem>
                <MenuItem value="CANCELLED">Cancelled</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                select
                fullWidth
                label="Time Period"
                name="days"
                value={filters.days}
                onChange={handleFilterChange}
              >
                <MenuItem value={7}>Last 7 days</MenuItem>
                <MenuItem value={30}>Last 30 days</MenuItem>
                <MenuItem value={90}>Last 3 months</MenuItem>
                <MenuItem value={365}>Last year</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Summary */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Total Transactions
              </Typography>
              <Typography variant="h4">
                {filteredTransactions.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Total Amount
              </Typography>
              <Typography variant="h4" color="primary">
                {formatCurrency(
                  filteredTransactions
                    .filter(t => t.status === 'COMPLETED')
                    .reduce((sum, t) => sum + parseFloat(t.amount), 0)
                )}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Completed
              </Typography>
              <Typography variant="h4" color="success.main">
                {filteredTransactions.filter(t => t.status === 'COMPLETED').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Pending
              </Typography>
              <Typography variant="h4" color="warning.main">
                {filteredTransactions.filter(t => t.status === 'PENDING').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Transactions List */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Transactions ({filteredTransactions.length})
          </Typography>
          
          {paginatedTransactions.length > 0 ? (
            <>
              <List>
                {paginatedTransactions.map((transaction, index) => {
                  const direction = getTransactionDirection(transaction);
                  const isCredit = direction === 'CREDIT';
                  
                  return (
                    <React.Fragment key={transaction.id}>
                      <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                        <ListItemText
                          primary={
                            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                              <Box>
                                <Typography variant="subtitle1" fontWeight="bold">
                                  {isCredit ? (
                                    <>From: {transaction.beneficiary_name || 'Unknown'}</>
                                  ) : (
                                    <>To: {transaction.beneficiary_name || 'Unknown'}</>
                                  )}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Account: {transaction.to_account_number}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {formatDateTime(transaction.created_at)}
                                </Typography>
                              </Box>
                              <Box textAlign="right">
                                <Box display="flex" alignItems="center" justifyContent="flex-end" mb={1}>
                                  {getTransactionIcon(direction)}
                                  <Typography 
                                    variant="h6" 
                                    color={getTransactionColor(direction)} 
                                    fontWeight="bold"
                                    sx={{ ml: 0.5 }}
                                  >
                                    {getTransactionPrefix(direction)}{formatCurrency(transaction.amount)}
                                  </Typography>
                                </Box>
                                
                                {/* Credit/Debit Message */}
                                <Typography 
                                  variant="caption" 
                                  sx={{ 
                                    color: getTransactionColor(direction),
                                    fontWeight: 'bold',
                                    fontSize: '0.75rem',
                                    display: 'block',
                                    mb: 1
                                  }}
                                >
                                  {isCredit ? '● Credited' : '● Debited'}
                                </Typography>
                                
                                <Chip 
                                  label={transaction.status} 
                                  color={getStatusColor(transaction.status)}
                                  size="small"
                                />
                              </Box>
                            </Box>
                          }
                          secondary={
                            <Box mt={1}>
                              <Typography variant="body2" color="text.secondary" component="div">
                                Transaction ID: {transaction.transaction_id}
                              </Typography>
                              {transaction.description && (
                                <Typography variant="body2" color="text.secondary" component="div">
                                  Description: {transaction.description}
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < paginatedTransactions.length - 1 && <Divider />}
                    </React.Fragment>
                  );
                })}
              </List>

              {/* Pagination */}
              {totalPages > 1 && (
                <Box display="flex" justifyContent="center" mt={3}>
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={handlePageChange}
                    color="primary"
                  />
                </Box>
              )}
            </>
          ) : (
            <Box textAlign="center" py={4}>
              <Typography variant="h6" color="text.secondary">
                No transactions found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {filters.search || filters.status !== 'ALL' 
                  ? 'Try adjusting your search filters'
                  : 'You haven\'t made any transactions yet'
                }
              </Typography>
              <Button 
                variant="contained" 
                onClick={() => navigate('/transfer')}
              >
                Make a Transfer
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default Transactions;