import { Container, Typography, Box } from '@mui/material';
import Layout from '@/src/components/layout/Layout';
import AuthGuard from '@/src/components/layout/AuthGuard';
import BestGrid from '@/src/components/best/BestGrid';
import { formatDisplayMonth, formatMonth } from '@/src/lib/utils';

export default function BestPage() {
  return (
    <AuthGuard>
      <Layout>
        <Container maxWidth="sm">
          <Box sx={{ pt: 2, pb: 4 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              ベスト選出
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
              {formatDisplayMonth(formatMonth())}
            </Typography>
            <BestGrid />
          </Box>
        </Container>
      </Layout>
    </AuthGuard>
  );
}
