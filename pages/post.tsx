import { Container, Typography, Box } from '@mui/material';
import Layout from '@/src/components/layout/Layout';
import AuthGuard from '@/src/components/layout/AuthGuard';
import PostForm from '@/src/components/photos/PostForm';

export default function PostPage() {
  return (
    <AuthGuard>
      <Layout>
        <Container maxWidth="sm">
          <Box sx={{ pt: 2, pb: 4 }}>
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
              写真を投稿
            </Typography>
            <PostForm />
          </Box>
        </Container>
      </Layout>
    </AuthGuard>
  );
}
