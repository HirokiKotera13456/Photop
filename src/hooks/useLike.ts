import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/src/lib/supabase/client';
import { useAuth } from './useAuth';

export function useLike(photoId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const likeQuery = useQuery({
    queryKey: ['likes', photoId, user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('likes')
        .select('id')
        .eq('photo_id', photoId)
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user && !!photoId,
  });

  const isLiked = !!likeQuery.data;

  const toggleLike = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('ログインが必要です');

      if (isLiked) {
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('photo_id', photoId)
          .eq('user_id', user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('likes')
          .insert({ user_id: user.id, photo_id: photoId });
        if (error) throw error;
      }
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['likes', photoId, user?.id] });
      const previous = queryClient.getQueryData(['likes', photoId, user?.id]);
      queryClient.setQueryData(
        ['likes', photoId, user?.id],
        isLiked ? null : { id: 'optimistic' }
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(['likes', photoId, user?.id], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['likes', photoId] });
      queryClient.invalidateQueries({ queryKey: ['photos'] });
    },
  });

  return { isLiked, toggleLike };
}
