import { Box, Button, CircularProgress, Typography } from '@mui/material';
import { usePhotos } from '@/src/hooks/usePhotos';
import PhotoCard from './PhotoCard';
import type { Tables } from '@/src/types/database';

export default function FeedList() {
  const { photos, feedQuery } = usePhotos();

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
        <Typography color="text.secondary">
          まだ写真がありません。最初の写真を投稿しましょう!
        </Typography>
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
