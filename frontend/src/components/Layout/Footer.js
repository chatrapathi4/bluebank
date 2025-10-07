import React from 'react';
import { Box, Container, Typography, Grid, Link } from '@mui/material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#003d82',
        color: 'white',
        py: 4,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>
              BlueBank
            </Typography>
            <Typography variant="body2">
              Your trusted banking partner providing secure and reliable financial services.
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>
              Services
            </Typography>
            <Link color="inherit" href="#" variant="body2" display="block">
              Net Banking
            </Link>
            <Link color="inherit" href="#" variant="body2" display="block">
              Fund Transfer
            </Link>
            <Link color="inherit" href="#" variant="body2" display="block">
              Account Management
            </Link>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>
              Support
            </Typography>
            <Link color="inherit" href="#" variant="body2" display="block">
              Help Center
            </Link>
            <Link color="inherit" href="#" variant="body2" display="block">
              Contact Us
            </Link>
            <Link color="inherit" href="#" variant="body2" display="block">
              Security
            </Link>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>
              Legal
            </Typography>
            <Link color="inherit" href="#" variant="body2" display="block">
              Privacy Policy
            </Link>
            <Link color="inherit" href="#" variant="body2" display="block">
              Terms of Service
            </Link>
          </Grid>
        </Grid>
        <Box mt={4} pt={2} borderTop={1} borderColor="rgba(255,255,255,0.1)">
          <Typography variant="body2" align="center">
            © 2024 BlueBank. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;