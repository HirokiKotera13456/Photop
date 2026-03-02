import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/src/lib/supabase/client';
import { useAuth } from './useAuth';

export function useComments(photoId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const commentsQuery = useQuery<any[]>({
    queryKey: ['comments', photoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comments')
        .select('*, profiles!user_id(display_name, avatar_url)')
        .eq('photo_id', photoId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!photoId,
  });

  const addComment = useMutation({
    mutationFn: async (body: string) => {
      if (!user) throw new Error('ログインが必要です');
      const { data, error } = await supabase
        .from('comments')
        .insert({ user_id: user.id, photo_id: photoId, body })
        .select('*, profiles!user_id(display_name, avatar_url)')
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', photoId] });
      queryClient.invalidateQueries({ queryKey: ['photos'] });
    },
  });

  const editComment = useMutation({
    mutationFn: async ({ commentId, body }: { commentId: string; body: string }) => {
      const { error } = await supabase
        .from('comments')
        .update({ body, updated_at: new Date().toISOString() })
        .eq('id', commentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', photoId] });
    },
  });

  const deleteComment = useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', photoId] });
      queryClient.invalidateQueries({ queryKey: ['photos'] });
    },
  });

  return {
    comments: commentsQuery.data ?? [],
    isLoading: commentsQuery.isLoading,
    addComment,
    editComment,
    deleteComment,
  };
}
