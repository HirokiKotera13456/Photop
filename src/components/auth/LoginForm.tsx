import { useState } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, TextField, Button, Alert } from '@mui/material';
import { useAuth } from '@/src/hooks/useAuth';
import { loginFormSchema, LoginFormValues } from '@/src/lib/validators';

export default function LoginForm() {
  const { signIn } = useAuth();
  const router = useRouter();
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
  });

  const onSubmit = async (values: LoginFormValues) => {
    setError('');
    try {
      await signIn(values.email, values.password);
      router.push('/feed');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'ログインに失敗しました';
      setError(msg);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {error && <Alert severity="error">{error}</Alert>}
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
      <Button type="submit" variant="contained" size="large" disabled={isSubmitting} fullWidth>
        {isSubmitting ? 'ログイン中...' : 'ログイン'}
      </Button>
    </Box>
  );
}
