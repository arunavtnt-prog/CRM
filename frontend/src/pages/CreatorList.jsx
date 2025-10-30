/**
 * Creator List Page
 * Story 1.1: View creator brand list
 * Story 2.4: Filter/sort List by Health Score
 */

import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

import { getCreators } from '../services/api';
import {
  getHealthScoreColor,
  getJourneyStatusColor,
  formatRelativeTime,
  filterCreatorsBySearch,
} from '../utils/helpers';
import { JOURNEY_STATUS, HEALTH_SCORE } from '../utils/constants';

export default function CreatorList() {
  const [creators, setCreators] = useState([]);
  const [filteredCreators, setFilteredCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [healthFilter, setHealthFilter] = useState('');

  useEffect(() => {
    loadCreators();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [creators, searchTerm, statusFilter, healthFilter]);

  const loadCreators = async () => {
    try {
      setLoading(true);
      const data = await getCreators();
      setCreators(data.results || data);
      setError(null);
    } catch (err) {
      setError('Failed to load creators');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...creators];

    // Search filter
    if (searchTerm) {
      filtered = filterCreatorsBySearch(filtered, searchTerm);
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter((c) => c.journey_status === statusFilter);
    }

    // Health filter (Story 2.4)
    if (healthFilter) {
      filtered = filtered.filter((c) => c.health_score === healthFilter);
    }

    setFilteredCreators(filtered);
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <div>
          <Typography variant="h4" fontWeight="bold">
            Creators & Brands
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {filteredCreators.length} of {creators.length} creators
          </Typography>
        </div>
        <Button variant="contained" startIcon={<AddIcon />}>
          Add Creator
        </Button>
      </Box>

      {/* Filters (Story 1.1, 2.4) */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box display="flex" gap={2}>
          <TextField
            label="Search"
            variant="outlined"
            size="small"
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, brand, email..."
          />

          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Journey Status</InputLabel>
            <Select
              value={statusFilter}
              label="Journey Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              {Object.keys(JOURNEY_STATUS).map((key) => (
                <MenuItem key={key} value={key}>
                  {key}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Health Score</InputLabel>
            <Select
              value={healthFilter}
              label="Health Score"
              onChange={(e) => setHealthFilter(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              {Object.keys(HEALTH_SCORE).map((key) => (
                <MenuItem key={key} value={key}>
                  {key}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Table (Story 1.1) */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Brand Name</TableCell>
              <TableCell>Creator</TableCell>
              <TableCell>Niche</TableCell>
              <TableCell>Journey Status</TableCell>
              <TableCell>Health Score</TableCell>
              <TableCell>Last Updated</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCreators.map((creator) => (
              <TableRow
                key={creator.id}
                component={RouterLink}
                to={`/creators/${creator.id}`}
                sx={{
                  textDecoration: 'none',
                  '&:hover': { backgroundColor: '#f5f5f5', cursor: 'pointer' },
                }}
              >
                <TableCell>
                  <Typography fontWeight="bold">{creator.brand_name}</Typography>
                </TableCell>
                <TableCell>{creator.creator_name}</TableCell>
                <TableCell>{creator.brand_niche}</TableCell>
                <TableCell>
                  <Chip
                    label={creator.journey_status_display}
                    size="small"
                    sx={{
                      backgroundColor: getJourneyStatusColor(creator.journey_status),
                      color: 'white',
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={creator.health_score}
                    size="small"
                    sx={{
                      backgroundColor: getHealthScoreColor(creator.health_score),
                      color: 'white',
                    }}
                  />
                </TableCell>
                <TableCell>{formatRelativeTime(creator.last_status_change)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {filteredCreators.length === 0 && (
        <Box textAlign="center" py={4}>
          <Typography color="text.secondary">No creators found</Typography>
        </Box>
      )}
    </Box>
  );
}
