import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Box, Container, Typography, Tabs, Tab } from '@mui/material';
import LoginForm from '@/src/components/auth/LoginForm';
import SignUpForm from '@/src/components/auth/SignUpForm';
import { useAuth } from '@/src/hooks/useAuth';

export default function LandingPage() {
  const [tab, setTab] = useState(0);
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace('/feed');
    }
  }, [user, loading, router]);

  if (loading || user) return null;

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          pt: 8,
          pb: 4,
        }}
      >
        <Typography variant="h3" component="h1" fontWeight="bold" color="primary" gutterBottom>
          Photop
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          ふたりの写真を、毎月ベストに。
        </Typography>

        <Box sx={{ width: '100%' }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} centered sx={{ mb: 3 }}>
            <Tab label="ログイン" />
            <Tab label="新規登録" />
          </Tabs>

          {tab === 0 ? <LoginForm /> : <SignUpForm />}
        </Box>
      </Box>
    </Container>
  );
}
