import { useState } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
} from '@mui/material';
import { useRouter } from 'next/router';
import { usePair } from '@/src/hooks/usePair';

export default function PairInfo() {
  const { pair, partner, dissolvePair, hasPair } = usePair();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');

  if (!hasPair || !partner) {
    return (
      <Box>
        <Typography color="text.secondary">ペアが設定されていません</Typography>
        <Button variant="outlined" sx={{ mt: 1 }} onClick={() => router.push('/pairing')}>
          ペアリングする
        </Button>
      </Box>
    );
  }

  const handleDissolve = async () => {
    setError('');
    try {
      await dissolvePair.mutateAsync();
      setOpen(false);
      router.push('/pairing');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '解除に失敗しました';
      setError(msg);
    }
  };

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
        <Avatar src={partner.avatar_url ?? undefined}>
          {partner.display_name[0]}
        </Avatar>
        <Box>
          <Typography fontWeight="bold">{partner.display_name}</Typography>
          <Typography variant="caption" color="text.secondary">
            パートナー
          </Typography>
        </Box>
      </Stack>
      <Button variant="outlined" color="error" onClick={() => setOpen(true)}>
        ペアを解除
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>ペアを解除しますか？</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ペアを解除すると、お互いの写真にアクセスできなくなります。この操作は取り消せません。
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>キャンセル</Button>
          <Button onClick={handleDissolve} color="error" disabled={dissolvePair.isPending}>
            {dissolvePair.isPending ? '解除中...' : '解除する'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
