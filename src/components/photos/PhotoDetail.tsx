import { Box, Typography, IconButton, CardMedia } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { usePhotoUrl, usePhotos } from '@/src/hooks/usePhotos';
import { formatRelativeTime } from '@/src/lib/utils';
import { useRouter } from 'next/router';
import type { Tables } from '@/src/types/database';

interface PhotoDetailProps {
  photo: Tables<'photos'>;
}

export default function PhotoDetail({ photo }: PhotoDetailProps) {
  const { data: imageUrl } = usePhotoUrl(photo.storage_path);
  const { deletePhoto } = usePhotos();
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm('この写真を削除しますか？')) return;
    await deletePhoto.mutateAsync(photo.id);
    router.push('/feed');
  };

  return (
    <Box>
      {imageUrl && (
        <CardMedia
          component="img"
          image={imageUrl}
          alt={photo.caption ?? '写真'}
          sx={{ width: '100%', maxHeight: 600, objectFit: 'contain', bgcolor: 'black' }}
        />
      )}

      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="caption" color="text.secondary">
            {formatRelativeTime(photo.created_at)}
          </Typography>
          <IconButton onClick={handleDelete} color="error" size="small">
            <DeleteIcon />
          </IconButton>
        </Box>

        {photo.caption && (
          <Typography variant="body1">
            {photo.caption}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
