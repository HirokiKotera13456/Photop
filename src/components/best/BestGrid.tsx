import { Box, ImageList, ImageListItem, Typography, CircularProgress, Alert } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useMonthlyBest } from '@/src/hooks/useMonthlyBest';
import { usePhotoUrl } from '@/src/hooks/usePhotos';

function BestPhotoItem({
  photo,
  isSelected,
  onSelect,
}: {
  photo: any;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const { data: imageUrl } = usePhotoUrl(photo.storage_path);

  return (
    <ImageListItem
      onClick={onSelect}
      sx={{
        cursor: 'pointer',
        position: 'relative',
        border: isSelected ? '3px solid' : '3px solid transparent',
        borderColor: isSelected ? 'primary.main' : 'transparent',
        borderRadius: 1,
        overflow: 'hidden',
      }}
    >
      {imageUrl && (
        <Box
          component="img"
          src={imageUrl}
          alt={photo.caption ?? '写真'}
          sx={{ width: '100%', height: 200, objectFit: 'cover' }}
        />
      )}
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
  const { partnerPhotos, mySelection, isLoading, selectBest } = useMonthlyBest();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (partnerPhotos.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <Typography color="text.secondary">
          今月のパートナーの写真はまだありません
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
        パートナーの今月の写真から、ベストを1枚選んでください
      </Typography>
      <ImageList cols={2} gap={8}>
        {partnerPhotos.map((photo: any) => (
          <BestPhotoItem
            key={photo.id}
            photo={photo}
            isSelected={mySelection?.photo_id === photo.id}
            onSelect={() => selectBest.mutate(photo.id)}
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
