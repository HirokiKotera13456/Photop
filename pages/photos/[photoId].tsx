import { useRouter } from 'next/router';
import { Container, Box, CircularProgress, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Layout from '@/src/components/layout/Layout';
import AuthGuard from '@/src/components/layout/AuthGuard';
import PhotoDetail from '@/src/components/photos/PhotoDetail';
import { usePhotoDetail } from '@/src/hooks/usePhotos';

function PhotoDetailContent() {
  const router = useRouter();
  const { photoId } = router.query;
  const { data: photo, isLoading } = usePhotoDetail(photoId as string);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!photo) return null;

  return (
    <Layout>
      <Container maxWidth="sm" disableGutters>
        <Box sx={{ p: 1 }}>
          <IconButton onClick={() => router.back()}>
            <ArrowBackIcon />
          </IconButton>
        </Box>
        <PhotoDetail photo={photo as any} />
      </Container>
    </Layout>
  );
}

export default function PhotoDetailPage() {
  return (
    <AuthGuard>
      <PhotoDetailContent />
    </AuthGuard>
  );
}
