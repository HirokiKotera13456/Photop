import { Container, Typography, Box } from '@mui/material';
import Layout from '@/src/components/layout/Layout';
import AuthGuard from '@/src/components/layout/AuthGuard';
import FeedList from '@/src/components/photos/FeedList';

export default function FeedPage() {
  return (
    <AuthGuard>
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
    </AuthGuard>
  );
}
