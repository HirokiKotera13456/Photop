import { Box, ImageList, ImageListItem, Typography, CircularProgress, Alert, Skeleton } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useMonthlyBest } from '@/src/hooks/useMonthlyBest';
import { usePhotoUrl } from '@/src/hooks/usePhotos';
import type { Tables } from '@/src/types/database';

function BestPhotoItem({
  photo,
  isSelected,
  onSelect,
  isSelecting,
}: {
  photo: Tables<'photos'>;
  isSelected: boolean;
  onSelect: () => void;
  isSelecting: boolean;
}) {
  const { data: imageUrl, isLoading: imageLoading } = usePhotoUrl(photo.storage_path);

  return (
    <ImageListItem
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`${photo.caption ?? '写真'}${isSelected ? '（選択中）' : ''}`}
      aria-pressed={isSelected}
      sx={{
        cursor: isSelecting ? 'wait' : 'pointer',
        position: 'relative',
        border: isSelected ? '3px solid' : '3px solid transparent',
        borderColor: isSelected ? 'primary.main' : 'transparent',
        borderRadius: 1,
        overflow: 'hidden',
        opacity: isSelecting ? 0.7 : 1,
        outline: 'none',
        '&:focus-visible': {
          boxShadow: '0 0 0 2px',
          borderColor: 'primary.light',
        },
      }}
    >
      {imageLoading ? (
        <Skeleton variant="rectangular" sx={{ width: '100%', height: 200 }} />
      ) : imageUrl ? (
        <Box
          component="img"
          src={imageUrl}
          alt={photo.caption ?? '写真'}
          loading="lazy"
          sx={{ width: '100%', height: 200, objectFit: 'cover' }}
        />
      ) : null}
      {isSelected && (
        <CheckCircleIcon
          color="primary"
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            bgcolor: 'white',
            borderRadius: '50%',
          }}
        />
      )}
    </ImageListItem>
  );
}

export default function BestGrid() {
  const { myPhotos, mySelection, isLoading, selectBest } = useMonthlyBest();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (myPhotos.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <Typography color="text.secondary">
          今月の写真はまだありません。まず写真を投稿しましょう!
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {selectBest.isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {selectBest.error instanceof Error ? selectBest.error.message : '選出に失敗しました'}
        </Alert>
      )}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        今月の写真から、ベストを1枚選んでください
      </Typography>
      <ImageList cols={2} gap={8}>
        {myPhotos.map((photo) => (
          <BestPhotoItem
            key={photo.id}
            photo={photo}
            isSelected={mySelection?.photo_id === photo.id}
            onSelect={() => selectBest.mutate(photo.id)}
            isSelecting={selectBest.isPending}
          />
        ))}
      </ImageList>
      {mySelection && (
        <Alert severity="success" sx={{ mt: 2 }}>
          ベストを選出しました。月末まで変更可能です。
        </Alert>
      )}
    </Box>
  );
}
