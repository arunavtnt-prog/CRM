/**
 * Dashboard Page
 * Epic 0.3: View Dashboard with key metrics
 * Story 0.3 Acceptance Criteria:
 * 1. Brand count
 * 2. Top 5 urgent projects
 * 3. Link to Creator List
 */

import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Chip,
  Link,
  Button,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningIcon from '@mui/icons-material/Warning';
import PeopleIcon from '@mui/icons-material/People';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import { getDashboardStats } from '../services/api';
import {
  getHealthScoreColor,
  getJourneyStatusLabel,
  getJourneyStatusColor,
  formatRelativeTime,
} from '../utils/helpers';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      const data = await getDashboardStats();
      setStats(data);
      setError(null);
    } catch (err) {
      setError('Failed to load dashboard statistics. Please try again.');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Studio Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        Overview of all creator projects and their status
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* Total Creators */}
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Total Creators
                  </Typography>
                  <Typography variant="h3" fontWeight="bold">
                    {stats.total_creators}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {stats.active_creators} active
                  </Typography>
                </Box>
                <PeopleIcon sx={{ fontSize: 48, color: '#1976d2' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Urgent Projects (Red Health) */}
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Urgent (Red)
                  </Typography>
                  <Typography variant="h3" fontWeight="bold" color="error">
                    {stats.red_health_count}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Needs immediate attention
                  </Typography>
                </Box>
                <WarningIcon sx={{ fontSize: 48, color: '#dc3545' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Warning Projects (Yellow Health) */}
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Warning (Yellow)
                  </Typography>
                  <Typography variant="h3" fontWeight="bold" sx={{ color: '#ffc107' }}>
                    {stats.yellow_health_count}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Monitor closely
                  </Typography>
                </Box>
                <TrendingUpIcon sx={{ fontSize: 48, color: '#ffc107' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* On Track (Green Health) */}
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    On Track (Green)
                  </Typography>
                  <Typography variant="h3" fontWeight="bold" sx={{ color: '#28a745' }}>
                    {stats.green_health_count}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    All good
                  </Typography>
                </Box>
                <CheckCircleIcon sx={{ fontSize: 48, color: '#28a745' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Journey Status Distribution */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Journey Status Distribution
            </Typography>
            <Box sx={{ mt: 2 }}>
              {[
                { label: 'Onboarding', count: stats.onboarding_count, color: '#FFA500' },
                { label: 'Brand Building', count: stats.brand_building_count, color: '#1E90FF' },
                { label: 'Launch', count: stats.launch_count, color: '#FFD700' },
                { label: 'Live', count: stats.live_count, color: '#32CD32' },
                { label: 'Paused', count: stats.paused_count, color: '#808080' },
                { label: 'Closed', count: stats.closed_count, color: '#DC143C' },
              ].map((item) => (
                <Box
                  key={item.label}
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mb: 1.5 }}
                >
                  <Box display="flex" alignItems="center">
                    <Box
                      sx={{
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        backgroundColor: item.color,
                        mr: 1.5,
                      }}
                    />
                    <Typography>{item.label}</Typography>
                  </Box>
                  <Typography fontWeight="bold">{item.count}</Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Urgent Projects List (Story 0.3: Top 5 urgent projects) */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight="bold">
                Urgent Projects
              </Typography>
              <Button
                component={RouterLink}
                to="/creators?filter=urgent"
                variant="outlined"
                size="small"
              >
                View All
              </Button>
            </Box>

            {stats.urgent_projects && stats.urgent_projects.length > 0 ? (
              <Box>
                {stats.urgent_projects.slice(0, 5).map((creator) => (
                  <Paper
                    key={creator.id}
                    elevation={1}
                    sx={{
                      p: 2,
                      mb: 1.5,
                      borderLeft: `4px solid ${getHealthScoreColor(creator.health_score)}`,
                      '&:hover': {
                        backgroundColor: '#f5f5f5',
                        cursor: 'pointer',
                      },
                    }}
                    component={RouterLink}
                    to={`/creators/${creator.id}`}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography fontWeight="bold">{creator.brand_name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {creator.creator_name}
                        </Typography>
                      </Box>
                      <Box display="flex" gap={1}>
                        <Chip
                          label={getJourneyStatusLabel(creator.journey_status)}
                          size="small"
                          sx={{
                            backgroundColor: getJourneyStatusColor(creator.journey_status),
                            color: 'white',
                          }}
                        />
                        <Chip
                          label={creator.health_score}
                          size="small"
                          sx={{
                            backgroundColor: getHealthScoreColor(creator.health_score),
                            color: 'white',
                          }}
                        />
                      </Box>
                    </Box>
                    <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                      Last updated: {formatRelativeTime(creator.last_status_change)}
                    </Typography>
                  </Paper>
                ))}
              </Box>
            ) : (
              <Alert severity="success">No urgent projects! All creators are on track.</Alert>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Updates */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Recent Updates
            </Typography>

            {stats.recent_updates && stats.recent_updates.length > 0 ? (
              <Box>
                {stats.recent_updates.map((creator) => (
                  <Box
                    key={creator.id}
                    sx={{
                      p: 2,
                      mb: 1,
                      borderRadius: 1,
                      border: '1px solid #e0e0e0',
                      '&:hover': {
                        backgroundColor: '#f5f5f5',
                      },
                    }}
                  >
                    <Link
                      component={RouterLink}
                      to={`/creators/${creator.id}`}
                      underline="hover"
                      color="inherit"
                    >
                      <Typography fontWeight="bold">{creator.brand_name}</Typography>
                    </Link>
                    <Typography variant="body2" color="text.secondary">
                      {creator.creator_name} • {creator.brand_niche}
                    </Typography>
                    <Box display="flex" gap={1} mt={1}>
                      <Chip label={creator.journey_status_display} size="small" />
                      <Chip
                        label={creator.health_score}
                        size="small"
                        sx={{
                          backgroundColor: getHealthScoreColor(creator.health_score),
                          color: 'white',
                        }}
                      />
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography color="text.secondary">No recent updates</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Link to Creator List (Story 0.3: Link to Creator List) */}
      <Box textAlign="center" sx={{ mt: 4 }}>
        <Button
          component={RouterLink}
          to="/creators"
          variant="contained"
          size="large"
          startIcon={<PeopleIcon />}
        >
          View All Creators
        </Button>
      </Box>
    </Box>
  );
}
