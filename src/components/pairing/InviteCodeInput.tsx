import { useState } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Box, TextField, Button, Alert } from '@mui/material';
import { inviteCodeSchema } from '@/src/lib/validators';
import { usePair } from '@/src/hooks/usePair';

const schema = z.object({ code: inviteCodeSchema });
type FormValues = z.infer<typeof schema>;

export default function InviteCodeInput() {
  const { joinPair } = usePair();
  const router = useRouter();
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: FormValues) => {
    setError('');
    try {
      await joinPair.mutateAsync(values.code);
      router.push('/feed');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'ペア参加に失敗しました';
      setError(msg);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {error && <Alert severity="error">{error}</Alert>}
      <TextField
        label="招待コード"
        placeholder="ABC123"
        {...register('code')}
        error={!!errors.code}
        helperText={errors.code?.message}
        inputProps={{
          maxLength: 6,
          style: { textTransform: 'uppercase', letterSpacing: 4, textAlign: 'center', fontSize: '1.5rem' },
        }}
        fullWidth
      />
      <Button type="submit" variant="contained" size="large" disabled={isSubmitting} fullWidth>
        {isSubmitting ? '参加中...' : 'ペアに参加'}
      </Button>
    </Box>
  );
}
