import { useState } from 'react';
import { Box, Button, Typography, Paper, Alert } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { usePair } from '@/src/hooks/usePair';

export default function InviteCodeGenerator() {
  const { generateInviteCode } = usePair();
  const [code, setCode] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    try {
      const result = await generateInviteCode.mutateAsync();
      setCode(result.invite_code);
      setExpiresAt(result.expires_at);
    } catch {
      // error handled by mutation state
    }
  };

  const handleCopy = async () => {
    if (!code) return;
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {generateInviteCode.isError && (
        <Alert severity="error">
          {generateInviteCode.error instanceof Error
            ? generateInviteCode.error.message
            : '招待コードの生成に失敗しました'}
        </Alert>
      )}

      {!code ? (
        <Button
          variant="contained"
          size="large"
          onClick={handleGenerate}
          disabled={generateInviteCode.isPending}
          fullWidth
        >
          {generateInviteCode.isPending ? '生成中...' : '招待コードを生成'}
        </Button>
      ) : (
        <>
          <Paper
            sx={{
              p: 3,
              textAlign: 'center',
              bgcolor: 'grey.50',
            }}
          >
            <Typography variant="body2" color="text.secondary" gutterBottom>
              招待コード
            </Typography>
            <Typography
              variant="h3"
              fontWeight="bold"
              letterSpacing={8}
              sx={{ fontFamily: 'monospace' }}
            >
              {code}
            </Typography>
            {expiresAt && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                有効期限: 24時間
              </Typography>
            )}
          </Paper>
          <Button
            variant="outlined"
            startIcon={<ContentCopyIcon />}
            onClick={handleCopy}
          >
            {copied ? 'コピーしました!' : 'コードをコピー'}
          </Button>
        </>
      )}
    </Box>
  );
}
