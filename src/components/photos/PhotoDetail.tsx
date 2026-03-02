import { useState } from 'react';
import { Box, Typography, IconButton, CardMedia, Skeleton, Alert } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { usePhotoUrl, usePhotos } from '@/src/hooks/usePhotos';
import { formatRelativeTime } from '@/src/lib/utils';
import { useRouter } from 'next/router';
import type { Tables } from '@/src/types/database';

interface PhotoDetailProps {
  photo: Tables<'photos'>;
}

export default function PhotoDetail({ photo }: PhotoDetailProps) {
  const { data: imageUrl, isLoading: imageLoading } = usePhotoUrl(photo.storage_path);
  const { deletePhoto } = usePhotos();
  const router = useRouter();
  const [deleteError, setDeleteError] = useState('');

  const handleDelete = async () => {
    if (!confirm('この写真を削除しますか？')) return;
    setDeleteError('');
    try {
      await deletePhoto.mutateAsync(photo.id);
      router.push('/feed');
    } catch (e: unknown) {
      setDeleteError(e instanceof Error ? e.message : '削除に失敗しました');
    }
  };

  return (
    <Box>
      {deleteError && <Alert severity="error" sx={{ m: 1 }}>{deleteError}</Alert>}
      {imageLoading ? (
        <Skeleton variant="rectangular" sx={{ width: '100%', height: 400 }} />
      ) : imageUrl ? (
        <CardMedia
          component="img"
          image={imageUrl}
          alt={photo.caption ?? '写真'}
          loading="lazy"
          sx={{ width: '100%', maxHeight: 600, objectFit: 'contain', bgcolor: 'black' }}
        />
      ) : null}

      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="caption" color="text.secondary">
            {formatRelativeTime(photo.created_at)}
          </Typography>
          <IconButton
            onClick={handleDelete}
            color="error"
            size="small"
            disabled={deletePhoto.isPending}
            aria-label="写真を削除"
          >
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
