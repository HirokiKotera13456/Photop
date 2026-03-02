import { IconButton } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useLike } from '@/src/hooks/useLike';
import { useAuth } from '@/src/hooks/useAuth';

interface LikeButtonProps {
  photoId: string;
  photoUserId: string;
}

export default function LikeButton({ photoId, photoUserId }: LikeButtonProps) {
  const { user } = useAuth();
  const { isLiked, toggleLike } = useLike(photoId);

  const isOwnPhoto = user?.id === photoUserId;

  return (
    <IconButton
      onClick={() => toggleLike.mutate()}
      disabled={isOwnPhoto || toggleLike.isPending}
      color={isLiked ? 'error' : 'default'}
      size="small"
    >
      {isLiked ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
    </IconButton>
  );
}
