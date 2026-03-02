import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, TextField, Button, Alert } from '@mui/material';
import { supabase } from '@/src/lib/supabase/client';
import { useAuth } from '@/src/hooks/useAuth';
import { profileEditSchema, ProfileEditValues } from '@/src/lib/validators';
import { useQueryClient } from '@tanstack/react-query';

interface ProfileEditFormProps {
  currentDisplayName: string;
}

export default function ProfileEditForm({ currentDisplayName }: ProfileEditFormProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileEditValues>({
    resolver: zodResolver(profileEditSchema),
    defaultValues: { displayName: currentDisplayName },
  });

  const onSubmit = async (values: ProfileEditValues) => {
    setError('');
    setSuccess(false);
    try {
      if (!user) throw new Error('ログインが必要です');
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ display_name: values.displayName })
        .eq('id', user.id);
      if (updateError) throw updateError;
      setSuccess(true);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '更新に失敗しました';
      setError(msg);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">プロフィールを更新しました</Alert>}
      <TextField
        label="表示名"
        {...register('displayName')}
        error={!!errors.displayName}
        helperText={errors.displayName?.message}
        fullWidth
      />
      <Button type="submit" variant="contained" disabled={isSubmitting}>
        {isSubmitting ? '更新中...' : '保存'}
      </Button>
    </Box>
  );
}
