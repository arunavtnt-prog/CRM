/**
 * Creator Detail Page
 * Story 1.2: View Creator Profile
 * Story 2.1: View Project Timeline/Roadmap
 * Story 2.2: Change Journey Status
 */

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

import { getCreator, getMilestonesByCreator, updateJourneyStatus } from '../services/api';
import {
  getHealthScoreColor,
  getJourneyStatusColor,
  formatDate,
} from '../utils/helpers';
import { JOURNEY_STATUS } from '../utils/constants';

export default function CreatorDetail() {
  const { id } = useParams();
  const [creator, setCreator] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    loadCreator();
    loadMilestones();
  }, [id]);

  const loadCreator = async () => {
    try {
      setLoading(true);
      const data = await getCreator(id);
      setCreator(data);
      setNewStatus(data.journey_status);
      setError(null);
    } catch (err) {
      setError('Failed to load creator');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadMilestones = async () => {
    try {
      const data = await getMilestonesByCreator(id);
      setMilestones(data);
    } catch (err) {
      console.error('Failed to load milestones:', err);
    }
  };

  const handleStatusChange = async () => {
    try {
      await updateJourneyStatus(id, newStatus);
      await loadCreator();
      alert('Status updated successfully!');
    } catch (err) {
      alert('Failed to update status');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !creator) {
    return <Alert severity="error">{error || 'Creator not found'}</Alert>;
  }

  return (
    <Box>
      {/* Header */}
      <Box mb={3}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          {creator.brand_name}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {creator.creator_name} • {creator.brand_niche}
        </Typography>
        <Box display="flex" gap={1} mt={1}>
          <Chip
            label={creator.journey_status_display}
            sx={{
              backgroundColor: getJourneyStatusColor(creator.journey_status),
              color: 'white',
            }}
          />
          <Chip
            label={creator.health_score}
            sx={{
              backgroundColor: getHealthScoreColor(creator.health_score),
              color: 'white',
            }}
          />
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Creator Info */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Creator Information
            </Typography>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Email
              </Typography>
              <Typography mb={1}>{creator.creator_email}</Typography>

              <Typography variant="body2" color="text.secondary">
                Phone
              </Typography>
              <Typography mb={1}>{creator.creator_phone || '-'}</Typography>

              <Typography variant="body2" color="text.secondary">
                Location
              </Typography>
              <Typography mb={1}>{creator.creator_location || '-'}</Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Brand Info */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Brand Information
            </Typography>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Website
              </Typography>
              <Typography mb={1}>{creator.brand_website || '-'}</Typography>

              <Typography variant="body2" color="text.secondary">
                Description
              </Typography>
              <Typography mb={1}>{creator.brand_description || '-'}</Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Journey Status Change (Story 2.2) */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Update Journey Status
            </Typography>
            <Box display="flex" gap={2} alignItems="center">
              <FormControl fullWidth>
                <InputLabel>Journey Status</InputLabel>
                <Select
                  value={newStatus}
                  label="Journey Status"
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  {Object.keys(JOURNEY_STATUS).map((key) => (
                    <MenuItem key={key} value={key}>
                      {key}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                variant="contained"
                onClick={handleStatusChange}
                disabled={newStatus === creator.journey_status}
              >
                Update
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Milestones (Story 2.1) */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Project Timeline & Milestones
            </Typography>
            {milestones.length > 0 ? (
              <Box>
                {milestones.map((milestone) => (
                  <Box
                    key={milestone.id}
                    sx={{
                      p: 2,
                      mb: 1,
                      border: '1px solid #e0e0e0',
                      borderRadius: 1,
                      textDecoration: milestone.is_completed ? 'line-through' : 'none',
                    }}
                  >
                    <Typography fontWeight="bold">{milestone.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {milestone.description}
                    </Typography>
                    <Typography variant="caption">
                      Target: {formatDate(milestone.target_date)}
                      {milestone.is_completed &&
                        ` • Completed: ${formatDate(milestone.completed_date)}`}
                    </Typography>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography color="text.secondary">No milestones yet</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
