import { Box, Card, CardContent, CardMedia, Typography, Stack } from '@mui/material';
import { usePhotoUrl } from '@/src/hooks/usePhotos';
import { formatDisplayMonth } from '@/src/lib/utils';

interface ArchiveCardProps {
  month: string;
  bests: {
    id: string;
    photos: {
      storage_path: string;
      caption: string | null;
      profiles: { display_name: string; avatar_url: string | null } | null;
    } | null;
  }[];
}

function ArchivePhotoThumb({ storagePath, name }: { storagePath: string; name: string }) {
  const { data: imageUrl } = usePhotoUrl(storagePath);
  return (
    <Box sx={{ flex: 1, minWidth: 0 }}>
      {imageUrl && (
        <CardMedia
          component="img"
          image={imageUrl}
          alt="ベスト写真"
          sx={{ height: 180, objectFit: 'cover', borderRadius: 1 }}
        />
      )}
      <Typography variant="caption" sx={{ mt: 0.5, display: 'block' }}>
        {name}
      </Typography>
    </Box>
  );
}

export default function ArchiveCard({ month, bests }: ArchiveCardProps) {
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
          {formatDisplayMonth(month)}
        </Typography>
        <Stack direction="row" spacing={1}>
          {bests.map((best) =>
            best.photos ? (
              <ArchivePhotoThumb
                key={best.id}
                storagePath={best.photos.storage_path}
                name={best.photos.profiles?.display_name ?? ''}
              />
            ) : null
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
