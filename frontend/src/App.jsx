/**
 * Main App Component for Wavelaunch Studio OS
 * Epic 0: System Foundation & Access
 * Epic 2: Project Lifecycle Visibility & Tracking
 */

import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';

// Components
import ProprietaryBanner from './components/ProprietaryBanner';
import Sidebar from './components/Sidebar';

// Pages
import Dashboard from './pages/Dashboard';
import CreatorList from './pages/CreatorList';
import CreatorDetail from './pages/CreatorDetail';
import AuditLogs from './pages/AuditLogs';

// Theme (can be customized to match brand)
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          {/* Epic 0.2: Non-dismissible proprietary banner */}
          <ProprietaryBanner />

          <Box sx={{ display: 'flex', flex: 1 }}>
            {/* Sidebar navigation */}
            <Sidebar open={sidebarOpen} onToggle={toggleSidebar} />

            {/* Main content area */}
            <Box
              component="main"
              sx={{
                flexGrow: 1,
                p: 3,
                ml: sidebarOpen ? '240px' : '64px',
                transition: 'margin 0.3s',
                backgroundColor: '#f5f5f5',
                minHeight: 'calc(100vh - 48px)', // Account for banner height
              }}
            >
              <Routes>
                {/* Epic 0.3: Dashboard */}
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />

                {/* Epic 1 & 2: Creator Management */}
                <Route path="/creators" element={<CreatorList />} />
                <Route path="/creators/:id" element={<CreatorDetail />} />

                {/* Epic 0.4: Audit Logs */}
                <Route path="/audit-logs" element={<AuditLogs />} />

                {/* Default redirect */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Box>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
