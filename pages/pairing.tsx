import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Box, Container, Typography, Divider } from '@mui/material';
import AuthGuard from '@/src/components/layout/AuthGuard';
import InviteCodeGenerator from '@/src/components/pairing/InviteCodeGenerator';
import InviteCodeInput from '@/src/components/pairing/InviteCodeInput';
import { usePair } from '@/src/hooks/usePair';

function PairingContent() {
  const { hasPair, isLoading } = usePair();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && hasPair) {
      router.replace('/feed');
    }
  }, [hasPair, isLoading, router]);

  if (isLoading || hasPair) return null;

  return (
    <Container maxWidth="sm">
      <Box sx={{ pt: 4, pb: 4 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          ペアリング
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          パートナーと繋がりましょう。招待コードを生成して共有するか、相手のコードを入力してください。
        </Typography>

        <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
          招待コードを生成
        </Typography>
        <InviteCodeGenerator />

        <Divider sx={{ my: 4 }}>または</Divider>

        <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
          招待コードを入力
        </Typography>
        <InviteCodeInput />
      </Box>
    </Container>
  );
}

export default function PairingPage() {
  return (
    <AuthGuard>
      <PairingContent />
    </AuthGuard>
  );
}
