/**
 * Proprietary Banner Component
 * Epic 0.2: Non-dismissible warning banner
 * Story 0.2 Acceptance Criteria:
 * 1. Banner non-dismissible, everywhere
 * 2. Message: "Wavelaunch Studio OS: Internal..."
 * 3. High-contrast color
 */

import { Alert } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';

export default function ProprietaryBanner() {
  return (
    <Alert
      severity="warning"
      icon={<WarningIcon />}
      sx={{
        borderRadius: 0,
        backgroundColor: '#ff6f00',
        color: 'white',
        fontWeight: 'bold',
        justifyContent: 'center',
        '& .MuiAlert-icon': {
          color: 'white',
        },
        '& .MuiAlert-message': {
          fontSize: '14px',
        },
      }}
    >
      WAVELAUNCH STUDIO OS: INTERNAL & PROPRIETARY - NOT FOR PUBLIC DISTRIBUTION
    </Alert>
  );
}
