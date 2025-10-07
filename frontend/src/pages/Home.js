import React from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import {
  AccountBalance,
  Security,
  Speed,
  Support,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <AccountBalance sx={{ fontSize: 40 }} />,
      title: 'Secure Banking',
      description: 'Advanced security measures to protect your financial data',
    },
    {
      icon: <Speed sx={{ fontSize: 40 }} />,
      title: 'Fast Transfers',
      description: 'Instant money transfers with real-time notifications',
    },
    {
      icon: <Security sx={{ fontSize: 40 }} />,
      title: 'Protected Accounts',
      description: 'Multi-layer security with encryption and fraud protection',
    },
    {
      icon: <Support sx={{ fontSize: 40 }} />,
      title: '24/7 Support',
      description: 'Round-the-clock customer support for all your needs',
    },
  ];

  return (
    <>
      {/* Hero Section */}
      <Box 
        sx={{ 
          background: 'linear-gradient(135deg, #003d82 0%, #4a6fa5 100%)',
          color: 'white',
          py: 8,
          textAlign: 'center'
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" gutterBottom>
            Welcome to BlueBank
          </Typography>
          <Typography variant="h5" component="p" sx={{ mb: 4 }}>
            Your Trusted Banking Partner - Secure, Fast, and Reliable
          </Typography>
          <Button 
            variant="contained" 
            color="secondary" 
            size="large"
            sx={{ mr: 2, mb: 2 }}
            onClick={() => navigate('/login')}
          >
            Login to Net Banking
          </Button>
          <Button 
            variant="outlined" 
            sx={{ 
              borderColor: 'white', 
              color: 'white',
              '&:hover': {
                borderColor: 'white',
                backgroundColor: 'rgba(255,255,255,0.1)'
              }
            }}
            size="large"
            onClick={() => navigate('/register')}
          >
            Open New Account
          </Button>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" component="h2" align="center" gutterBottom>
          Why Choose BlueBank?
        </Typography>
        <Grid container spacing={4} sx={{ mt: 2 }}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card 
                sx={{ 
                  height: '100%', 
                  textAlign: 'center',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  }
                }}
              >
                <CardContent>
                  <Box sx={{ color: 'primary.main', mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h5" component="h3" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Call to Action */}
      <Box sx={{ backgroundColor: '#f5f7fa', py: 6 }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography variant="h4" component="h2" gutterBottom>
            Ready to Get Started?
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
            Join millions of customers who trust BlueBank for their financial needs
          </Typography>
          <Button 
            variant="contained" 
            size="large" 
            sx={{ mr: 2 }}
            onClick={() => navigate('/register')}
          >
            Open Account Today
          </Button>
          <Button 
            variant="outlined" 
            size="large"
            onClick={() => navigate('/login')}
          >
            Existing Customer Login
          </Button>
        </Container>
      </Box>
    </>
  );
};

export default Home;