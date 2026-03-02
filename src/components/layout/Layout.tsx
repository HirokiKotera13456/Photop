import { ReactNode } from 'react';
import { Box } from '@mui/material';
import BottomNav from './BottomNav';

interface LayoutProps {
  children: ReactNode;
  hideNav?: boolean;
}

export default function Layout({ children, hideNav = false }: LayoutProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Box
        component="main"
        sx={{
          flex: 1,
          pb: hideNav ? 0 : '72px',
          maxWidth: 600,
          width: '100%',
          mx: 'auto',
        }}
      >
        {children}
      </Box>
      {!hideNav && <BottomNav />}
    </Box>
  );
}
