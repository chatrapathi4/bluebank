import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  TextField,
  MenuItem,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Send,
  CheckCircle,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Transfer = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [confirmDialog, setConfirmDialog] = useState(false);
  
  const [transferData, setTransferData] = useState({
    from_account_id: '',
    to_account_number: '',
    to_ifsc_code: '',
    beneficiary_name: '',
    amount: '',
    description: '',
  });

  const steps = ['Select Account', 'Enter Details', 'Confirm Transfer'];

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await axios.get('/api/accounts/summary/');
      setAccounts(response.data.accounts || []);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      setError('Failed to load accounts');
    }
  };

  const handleChange = (e) => {
    setTransferData({
      ...transferData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleNext = () => {
    if (validateStep()) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const validateStep = () => {
    switch (activeStep) {
      case 0:
        if (!transferData.from_account_id) {
          setError('Please select an account');
          return false;
        }
        break;
      case 1:
        if (!transferData.to_account_number || !transferData.to_ifsc_code || 
            !transferData.beneficiary_name || !transferData.amount) {
          setError('Please fill all required fields');
          return false;
        }
        if (parseFloat(transferData.amount) <= 0) {
          setError('Amount must be greater than 0');
          return false;
        }
        break;
      default:
        break;
    }
    return true;
  };

  const handleTransfer = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post('/api/transactions/transfer/', transferData);
      setSuccess(`Transfer successful! Transaction ID: ${response.data.transaction_id}`);
      setConfirmDialog(false);
      
      // Reset form after successful transfer
      setTimeout(() => {
        navigate('/transactions');
      }, 3000);
      
    } catch (error) {
      setError(error.response?.data?.message || 'Transfer failed');
      setConfirmDialog(false);
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

  const selectedAccount = accounts.find(acc => acc.id === parseInt(transferData.from_account_id));

  if (success) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <Card>
          <CardContent sx={{ py: 6 }}>
            <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
            <Typography variant="h4" gutterBottom color="success.main">
              Transfer Successful!
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              {success}
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => navigate('/transactions')}
              sx={{ mr: 2 }}
            >
              View Transactions
            </Button>
            <Button 
              variant="outlined" 
              onClick={() => navigate('/dashboard')}
            >
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Fund Transfer
      </Typography>
      
      {/* Stepper */}
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          {/* Step 0: Select Account */}
          {activeStep === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Select Source Account
              </Typography>
              <TextField
                select
                fullWidth
                label="From Account"
                name="from_account_id"
                value={transferData.from_account_id}
                onChange={handleChange}
                margin="normal"
              >
                {accounts.map((account) => (
                  <MenuItem key={account.id} value={account.id}>
                    {account.account_number} - {account.account_type} 
                    (Balance: {formatCurrency(account.balance)})
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          )}

          {/* Step 1: Enter Transfer Details */}
          {activeStep === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Transfer Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Beneficiary Account Number"
                    name="to_account_number"
                    value={transferData.to_account_number}
                    onChange={handleChange}
                    margin="normal"
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="IFSC Code"
                    name="to_ifsc_code"
                    value={transferData.to_ifsc_code}
                    onChange={handleChange}
                    margin="normal"
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Beneficiary Name"
                    name="beneficiary_name"
                    value={transferData.beneficiary_name}
                    onChange={handleChange}
                    margin="normal"
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Amount"
                    name="amount"
                    type="number"
                    value={transferData.amount}
                    onChange={handleChange}
                    margin="normal"
                    required
                    inputProps={{ min: 1, step: 0.01 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description (Optional)"
                    name="description"
                    value={transferData.description}
                    onChange={handleChange}
                    margin="normal"
                    multiline
                    rows={2}
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Step 2: Confirm Transfer */}
          {activeStep === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Confirm Transfer Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">From Account:</Typography>
                  <Typography variant="body1">
                    {selectedAccount?.account_number} - {selectedAccount?.account_type}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Available Balance: {formatCurrency(selectedAccount?.balance || 0)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">To Account:</Typography>
                  <Typography variant="body1">{transferData.to_account_number}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {transferData.beneficiary_name}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Transfer Amount:</Typography>
                  <Typography variant="h5" color="primary">
                    {formatCurrency(transferData.amount || 0)}
                  </Typography>
                </Grid>
                {transferData.description && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2">Description:</Typography>
                    <Typography variant="body1">{transferData.description}</Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}

          {/* Navigation Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button
              onClick={handleBack}
              disabled={activeStep === 0}
              variant="outlined"
            >
              Back
            </Button>
            
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={() => setConfirmDialog(true)}
                startIcon={<Send />}
              >
                Transfer Money
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
              >
                Next
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog} onClose={() => setConfirmDialog(false)}>
        <DialogTitle>Confirm Transfer</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to transfer {formatCurrency(transferData.amount || 0)} 
            to {transferData.beneficiary_name}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleTransfer} 
            variant="contained" 
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : 'Confirm Transfer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Transfer;