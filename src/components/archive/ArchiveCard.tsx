import { Card, CardContent, CardMedia, Typography } from '@mui/material';
import { usePhotoUrl } from '@/src/hooks/usePhotos';
import { formatDisplayMonth } from '@/src/lib/utils';

interface ArchiveCardProps {
  month: string;
  best: {
    id: string;
    photos: {
      storage_path: string;
      caption: string | null;
    } | null;
  };
}

function ArchivePhoto({ storagePath, caption }: { storagePath: string; caption: string | null }) {
  const { data: imageUrl } = usePhotoUrl(storagePath);
  return (
    <>
      {imageUrl && (
        <CardMedia
          component="img"
          image={imageUrl}
          alt="ベスト写真"
          sx={{ height: 300, objectFit: 'cover' }}
        />
      )}
      {caption && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {caption}
        </Typography>
      )}
    </>
  );
}

export default function ArchiveCard({ month, best }: ArchiveCardProps) {
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
          {formatDisplayMonth(month)}
        </Typography>
        {best.photos ? (
          <ArchivePhoto storagePath={best.photos.storage_path} caption={best.photos.caption} />
        ) : (
          <Typography color="text.secondary">写真が削除されました</Typography>
        )}
      </CardContent>
    </Card>
  );
}
