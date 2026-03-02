import { Box, ImageList, ImageListItem, CircularProgress } from '@mui/material';
import { useRouter } from 'next/router';
import { usePhotoUrl } from '@/src/hooks/usePhotos';

function GridItem({ photo }: { photo: any }) {
  const { data: imageUrl } = usePhotoUrl(photo.storage_path);
  const router = useRouter();

  return (
    <ImageListItem
      onClick={() => router.push(`/photos/${photo.id}`)}
      sx={{ cursor: 'pointer' }}
    >
      {imageUrl ? (
        <Box
          component="img"
          src={imageUrl}
          alt={photo.caption ?? '写真'}
          sx={{ width: '100%', height: 150, objectFit: 'cover' }}
        />
      ) : (
        <Box sx={{ width: '100%', height: 150, bgcolor: 'grey.200' }} />
      )}
    </ImageListItem>
  );
}

interface PhotoGridProps {
  photos: any[];
  isLoading: boolean;
}

export default function PhotoGrid({ photos, isLoading }: PhotoGridProps) {
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ImageList cols={3} gap={2}>
      {photos.map((photo: any) => (
        <GridItem key={photo.id} photo={photo} />
      ))}
    </ImageList>
  );
}
