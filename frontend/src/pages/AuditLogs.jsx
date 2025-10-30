/**
 * Audit Logs Page
 * Epic 0.4: System Audit Log (Read-only)
 */

import { useState, useEffect } from 'react';
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
} from '@mui/material';

import { getAuditLogs } from '../services/api';
import { formatDateTime } from '../utils/helpers';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAuditLogs();
  }, []);

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      const data = await getAuditLogs();
      setLogs(data.results || data);
      setError(null);
    } catch (err) {
      setError('Failed to load audit logs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action) => {
    const colorMap = {
      CREATE: 'success',
      UPDATE: 'info',
      DELETE: 'error',
      VIEW: 'default',
    };
    return colorMap[action] || 'default';
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
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        System Audit Log
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Read-only log of all sensitive actions. {logs.length} entries.
      </Typography>

      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Timestamp</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Action</TableCell>
              <TableCell>Target</TableCell>
              <TableCell>IP Address</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>{formatDateTime(log.timestamp)}</TableCell>
                <TableCell>{log.user_email}</TableCell>
                <TableCell>
                  <Chip label={log.action_type} size="small" color={getActionColor(log.action_type)} />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{log.target_model}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {log.target_display}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="caption">{log.ip_address || '-'}</Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {logs.length === 0 && (
        <Box textAlign="center" py={4}>
          <Typography color="text.secondary">No audit logs found</Typography>
        </Box>
      )}
    </Box>
  );
}
