import { Box, Card, CardContent, CardMedia, Typography, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useRouter } from 'next/router';
import { usePhotoUrl, usePhotos } from '@/src/hooks/usePhotos';
import { formatRelativeTime } from '@/src/lib/utils';
import type { Tables } from '@/src/types/database';

interface PhotoCardProps {
  photo: Tables<'photos'>;
}

export default function PhotoCard({ photo }: PhotoCardProps) {
  const router = useRouter();
  const { data: imageUrl } = usePhotoUrl(photo.storage_path);
  const { deletePhoto } = usePhotos();

  const handleDelete = async () => {
    if (!confirm('この写真を削除しますか？')) return;
    await deletePhoto.mutateAsync(photo.id);
  };

  return (
    <Card sx={{ mb: 2 }}>
      {imageUrl && (
        <CardMedia
          component="img"
          image={imageUrl}
          alt={photo.caption ?? '写真'}
          sx={{ width: '100%', maxHeight: 500, objectFit: 'cover', cursor: 'pointer' }}
          onClick={() => router.push(`/photos/${photo.id}`)}
        />
      )}

      <CardContent sx={{ pb: '8px !important' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            {formatRelativeTime(photo.created_at)}
          </Typography>
          <IconButton size="small" onClick={handleDelete} color="error">
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
        {photo.caption && (
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            {photo.caption}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
