import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Container, Typography, Box } from '@mui/material';
import Layout from '@/src/components/layout/Layout';
import AuthGuard from '@/src/components/layout/AuthGuard';
import FeedList from '@/src/components/photos/FeedList';
import { usePair } from '@/src/hooks/usePair';

function FeedContent() {
  const { hasPair, isLoading } = usePair();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !hasPair) {
      router.replace('/pairing');
    }
  }, [hasPair, isLoading, router]);

  if (isLoading || !hasPair) return null;

  return (
    <Layout>
      <Container maxWidth="sm" disableGutters>
        <Box sx={{ p: 2 }}>
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
            フィード
          </Typography>
        </Box>
        <FeedList />
      </Container>
    </Layout>
  );
}

export default function FeedPage() {
  return (
    <AuthGuard>
      <FeedContent />
    </AuthGuard>
  );
}
