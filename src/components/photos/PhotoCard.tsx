import { Box, Card, CardContent, CardMedia, Typography, Avatar, Stack } from '@mui/material';
import { useRouter } from 'next/router';
import { usePhotoUrl } from '@/src/hooks/usePhotos';
import { formatRelativeTime } from '@/src/lib/utils';
import LikeButton from './LikeButton';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import IconButton from '@mui/material/IconButton';

interface PhotoCardProps {
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

export default function PhotoCard({ photo }: PhotoCardProps) {
  const router = useRouter();
  const { data: imageUrl } = usePhotoUrl(photo.storage_path);
  const likeCount = photo.likes?.[0]?.count ?? 0;
  const commentCount = photo.comments?.[0]?.count ?? 0;

  return (
    <Card sx={{ mb: 2 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ p: 1.5 }}>
        <Avatar
          src={photo.profiles?.avatar_url ?? undefined}
          sx={{ width: 32, height: 32 }}
        >
          {photo.profiles?.display_name?.[0]}
        </Avatar>
        <Typography variant="subtitle2" fontWeight="bold">
          {photo.profiles?.display_name}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto !important' }}>
          {formatRelativeTime(photo.created_at)}
        </Typography>
      </Stack>

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
        <Stack direction="row" alignItems="center" spacing={1}>
          <LikeButton photoId={photo.id} photoUserId={photo.user_id} />
          <Typography variant="body2">{likeCount}</Typography>
          <IconButton size="small" onClick={() => router.push(`/photos/${photo.id}`)}>
            <ChatBubbleOutlineIcon fontSize="small" />
          </IconButton>
          <Typography variant="body2">{commentCount}</Typography>
        </Stack>
        {photo.caption && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            <strong>{photo.profiles?.display_name}</strong>{' '}
            {photo.caption}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
