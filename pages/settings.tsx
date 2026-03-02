import { useQuery } from '@tanstack/react-query';
import { Container, Typography, Box, Divider, Button, CircularProgress } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import Layout from '@/src/components/layout/Layout';
import AuthGuard from '@/src/components/layout/AuthGuard';
import ProfileEditForm from '@/src/components/settings/ProfileEditForm';
import PairInfo from '@/src/components/settings/PairInfo';
import { useAuth } from '@/src/hooks/useAuth';
import { supabase } from '@/src/lib/supabase/client';
import type { Tables } from '@/src/types/database';

function SettingsContent() {
  const { user, signOut } = useAuth();

  const profileQuery = useQuery<Tables<'profiles'> | null>({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  if (profileQuery.isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Layout>
      <Container maxWidth="sm">
        <Box sx={{ pt: 2, pb: 4 }}>
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
            設定
          </Typography>

          <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
            プロフィール
          </Typography>
          {profileQuery.data && (
            <ProfileEditForm currentDisplayName={profileQuery.data.display_name} />
          )}

          <Divider sx={{ my: 3 }} />

          <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
            ペア情報
          </Typography>
          <PairInfo />

          <Divider sx={{ my: 3 }} />

          <Button
            variant="outlined"
            color="error"
            startIcon={<LogoutIcon />}
            onClick={signOut}
            fullWidth
          >
            ログアウト
          </Button>
        </Box>
      </Container>
    </Layout>
  );
}

export default function SettingsPage() {
  return (
    <AuthGuard>
      <SettingsContent />
    </AuthGuard>
  );
}
