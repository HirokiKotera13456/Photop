import { useState } from 'react';
import { Box, Card, CardContent, CardMedia, Typography, IconButton, Skeleton, Alert } from '@mui/material';
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
  const { data: imageUrl, isLoading: imageLoading } = usePhotoUrl(photo.storage_path);
  const { deletePhoto } = usePhotos();
  const [deleteError, setDeleteError] = useState('');

  const handleDelete = async () => {
    if (!confirm('この写真を削除しますか？')) return;
    setDeleteError('');
    try {
      await deletePhoto.mutateAsync(photo.id);
    } catch (e: unknown) {
      setDeleteError(e instanceof Error ? e.message : '削除に失敗しました');
    }
  };

  return (
    <Card sx={{ mb: 2 }}>
      {deleteError && <Alert severity="error" sx={{ m: 1 }}>{deleteError}</Alert>}
      {imageLoading ? (
        <Skeleton variant="rectangular" sx={{ width: '100%', height: 300 }} />
      ) : imageUrl ? (
        <CardMedia
          component="img"
          image={imageUrl}
          alt={photo.caption ?? '写真'}
          loading="lazy"
          sx={{ width: '100%', maxHeight: 500, objectFit: 'cover', cursor: 'pointer' }}
          onClick={() => router.push(`/photos/${photo.id}`)}
        />
      ) : null}

      <CardContent sx={{ pb: '8px !important' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            {formatRelativeTime(photo.created_at)}
          </Typography>
          <IconButton
            size="small"
            onClick={handleDelete}
            color="error"
            disabled={deletePhoto.isPending}
            aria-label="写真を削除"
          >
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
