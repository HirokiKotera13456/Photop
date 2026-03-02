import { Box, Button, CircularProgress, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { usePhotos } from '@/src/hooks/usePhotos';
import PhotoCard from './PhotoCard';
import type { Tables } from '@/src/types/database';

export default function FeedList() {
  const { photos, feedQuery } = usePhotos();
  const router = useRouter();

  if (feedQuery.isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (photos.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          まだ写真がありません。最初の写真を投稿しましょう!
        </Typography>
        <Button variant="contained" onClick={() => router.push('/post')}>
          写真を投稿する
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {photos.map((photo: Tables<'photos'>) => (
        <PhotoCard key={photo.id} photo={photo} />
      ))}
      {feedQuery.hasNextPage && (
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Button
            onClick={() => feedQuery.fetchNextPage()}
            disabled={feedQuery.isFetchingNextPage}
          >
            {feedQuery.isFetchingNextPage ? 'ロード中...' : 'もっと見る'}
          </Button>
        </Box>
      )}
    </Box>
  );
}
