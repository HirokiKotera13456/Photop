import { Box, Typography, Avatar, Stack, IconButton, CardMedia } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { usePhotoUrl, usePhotos } from '@/src/hooks/usePhotos';
import { useAuth } from '@/src/hooks/useAuth';
import { formatRelativeTime } from '@/src/lib/utils';
import LikeButton from './LikeButton';
import CommentList from '@/src/components/comments/CommentList';
import CommentInput from '@/src/components/comments/CommentInput';
import { useRouter } from 'next/router';

interface PhotoDetailProps {
  photo: {
    id: string;
    user_id: string;
    storage_path: string;
    caption: string | null;
    created_at: string;
    profiles: { display_name: string; avatar_url: string | null } | null;
    likes: { count: number }[] | null;
    comments: { count: number }[] | null;
  };
}

export default function PhotoDetail({ photo }: PhotoDetailProps) {
  const { data: imageUrl } = usePhotoUrl(photo.storage_path);
  const { user } = useAuth();
  const { deletePhoto } = usePhotos();
  const router = useRouter();
  const isOwner = user?.id === photo.user_id;
  const likeCount = photo.likes?.[0]?.count ?? 0;

  const handleDelete = async () => {
    if (!confirm('この写真を削除しますか？')) return;
    await deletePhoto.mutateAsync(photo.id);
    router.push('/feed');
  };

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ p: 2 }}>
        <Avatar src={photo.profiles?.avatar_url ?? undefined} sx={{ width: 40, height: 40 }}>
          {photo.profiles?.display_name?.[0]}
        </Avatar>
        <Box>
          <Typography variant="subtitle2" fontWeight="bold">
            {photo.profiles?.display_name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {formatRelativeTime(photo.created_at)}
          </Typography>
        </Box>
        {isOwner && (
          <IconButton onClick={handleDelete} sx={{ ml: 'auto !important' }} color="error" size="small">
            <DeleteIcon />
          </IconButton>
        )}
      </Stack>

      {imageUrl && (
        <CardMedia
          component="img"
          image={imageUrl}
          alt={photo.caption ?? '写真'}
          sx={{ width: '100%', maxHeight: 600, objectFit: 'contain', bgcolor: 'black' }}
        />
      )}

      <Box sx={{ p: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
          <LikeButton photoId={photo.id} photoUserId={photo.user_id} />
          <Typography variant="body2">{likeCount}件のいいね</Typography>
        </Stack>

        {photo.caption && (
          <Typography variant="body1" sx={{ mb: 2 }}>
            <strong>{photo.profiles?.display_name}</strong>{' '}
            {photo.caption}
          </Typography>
        )}

        <CommentList photoId={photo.id} />
        <CommentInput photoId={photo.id} />
      </Box>
    </Box>
  );
}
