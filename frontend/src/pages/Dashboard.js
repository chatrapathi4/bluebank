import React from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Welcome Section */}
      <Box mb={4}>
        <Typography variant="h4" gutterBottom>
          Welcome back, {user?.first_name || user?.username}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's an overview of your banking activities
        </Typography>
      </Box>

      {/* Simple Dashboard for now */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Dashboard
          </Typography>
          <Typography variant="body1">
            Your BlueBank dashboard is ready! We'll add more features here like:
          </Typography>
          <Box component="ul" sx={{ mt: 2 }}>
            <li>Account summaries</li>
            <li>Recent transactions</li>
            <li>Quick actions</li>
            <li>Account balances</li>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Dashboard;