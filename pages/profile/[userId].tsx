import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { Container, Box, CircularProgress, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Layout from '@/src/components/layout/Layout';
import AuthGuard from '@/src/components/layout/AuthGuard';
import ProfileHeader from '@/src/components/profile/ProfileHeader';
import PhotoGrid from '@/src/components/profile/PhotoGrid';
import { supabase } from '@/src/lib/supabase/client';
import type { Tables } from '@/src/types/database';

function ProfileContent() {
  const router = useRouter();
  const { userId } = router.query;

  const profileQuery = useQuery<Tables<'profiles'> | null>({
    queryKey: ['profile', userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId as string)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const photosQuery = useQuery<Tables<'photos'>[]>({
    queryKey: ['user-photos', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .eq('user_id', userId as string)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!userId,
  });

  if (profileQuery.isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!profileQuery.data) return null;

  return (
    <Layout>
      <Container maxWidth="sm">
        <Box sx={{ pt: 1 }}>
          <IconButton onClick={() => router.back()}>
            <ArrowBackIcon />
          </IconButton>
        </Box>
        <ProfileHeader
          profile={profileQuery.data}
          photoCount={photosQuery.data?.length ?? 0}
        />
        <PhotoGrid
          photos={photosQuery.data ?? []}
          isLoading={photosQuery.isLoading}
        />
      </Container>
    </Layout>
  );
}

export default function ProfilePage() {
  return (
    <AuthGuard>
      <ProfileContent />
    </AuthGuard>
  );
}
