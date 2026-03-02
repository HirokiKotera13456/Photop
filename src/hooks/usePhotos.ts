import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/src/lib/supabase/client';
import { useAuth } from './useAuth';
import { getStoragePath, formatMonth } from '@/src/lib/utils';
import { FEED_PAGE_SIZE, SIGNED_URL_EXPIRY, SIGNED_URL_STALE_TIME, QUERY_KEYS } from '@/src/lib/constants';

export function usePhotos() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const feedQuery = useInfiniteQuery({
    queryKey: QUERY_KEYS.photos.feed(user?.id),
    queryFn: async ({ pageParam = 0 }) => {
      if (!user) return { data: [], nextPage: null };
      const from = pageParam * FEED_PAGE_SIZE;
      const to = from + FEED_PAGE_SIZE - 1;

      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;
      return {
        data: data ?? [],
        nextPage: (data?.length ?? 0) === FEED_PAGE_SIZE ? pageParam + 1 : null,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
    enabled: !!user,
  });

  const uploadPhoto = useMutation({
    mutationFn: async ({ file, caption }: { file: File; caption?: string }) => {
      if (!user) throw new Error('認証が必要です');

      const storagePath = getStoragePath(user.id, file.name);

      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(storagePath, file);
      if (uploadError) throw uploadError;

      const month = formatMonth();

      const { data, error } = await supabase
        .from('photos')
        .insert({
          user_id: user.id,
          storage_path: storagePath,
          caption: caption || null,
          month,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photos'] });
      queryClient.invalidateQueries({ queryKey: ['my-photos-month'] });
    },
  });

  const deletePhoto = useMutation({
    mutationFn: async (photoId: string) => {
      const { data: photo, error: fetchError } = await supabase
        .from('photos')
        .select('storage_path')
        .eq('id', photoId)
        .single();
      if (fetchError) throw fetchError;

      const { error: deleteStorageError } = await supabase.storage
        .from('photos')
        .remove([photo.storage_path]);
      if (deleteStorageError) throw deleteStorageError;

      const { error } = await supabase
        .from('photos')
        .delete()
        .eq('id', photoId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photos'] });
      queryClient.invalidateQueries({ queryKey: ['my-photos-month'] });
      queryClient.invalidateQueries({ queryKey: ['archive'] });
    },
  });

  return {
    feedQuery,
    photos: feedQuery.data?.pages.flatMap((p) => p.data) ?? [],
    uploadPhoto,
    deletePhoto,
  };
}

export function usePhotoDetail(photoId: string | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.photos.detail(photoId),
    queryFn: async () => {
      if (!photoId) return null;
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .eq('id', photoId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!photoId,
  });
}

export function usePhotoUrl(storagePath: string | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.photoUrl(storagePath),
    queryFn: async () => {
      if (!storagePath) return null;
      const { data, error } = await supabase.storage
        .from('photos')
        .createSignedUrl(storagePath, SIGNED_URL_EXPIRY);
      if (error) throw error;
      return data.signedUrl;
    },
    enabled: !!storagePath,
    staleTime: SIGNED_URL_STALE_TIME,
  });
}
