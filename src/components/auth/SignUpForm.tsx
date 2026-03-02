import { useState } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, TextField, Button, Alert } from '@mui/material';
import { useAuth } from '@/src/hooks/useAuth';
import { signUpFormSchema, SignUpFormValues } from '@/src/lib/validators';

export default function SignUpForm() {
  const { signUp } = useAuth();
  const router = useRouter();
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpFormSchema),
  });

  const onSubmit = async (values: SignUpFormValues) => {
    setError('');
    try {
      await signUp(values.email, values.password, values.displayName);
      router.push('/feed');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '登録に失敗しました';
      setError(msg);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {error && <Alert severity="error">{error}</Alert>}
      <TextField
        label="表示名"
        {...register('displayName')}
        error={!!errors.displayName}
        helperText={errors.displayName?.message}
        fullWidth
      />
      <TextField
        label="メールアドレス"
        type="email"
        {...register('email')}
        error={!!errors.email}
        helperText={errors.email?.message}
        fullWidth
      />
      <TextField
        label="パスワード"
        type="password"
        {...register('password')}
        error={!!errors.password}
        helperText={errors.password?.message}
        fullWidth
      />
      <TextField
        label="パスワード確認"
        type="password"
        {...register('confirmPassword')}
        error={!!errors.confirmPassword}
        helperText={errors.confirmPassword?.message}
        fullWidth
      />
      <Button type="submit" variant="contained" size="large" disabled={isSubmitting} fullWidth>
        {isSubmitting ? '登録中...' : 'アカウント作成'}
      </Button>
    </Box>
  );
}
