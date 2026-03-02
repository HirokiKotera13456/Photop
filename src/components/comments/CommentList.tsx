import { useState } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Stack,
  IconButton,
  TextField,
  Button,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useComments } from '@/src/hooks/useComments';
import { useAuth } from '@/src/hooks/useAuth';
import { formatRelativeTime } from '@/src/lib/utils';

interface CommentListProps {
  photoId: string;
}

export default function CommentList({ photoId }: CommentListProps) {
  const { comments, isLoading, editComment, deleteComment } = useComments(photoId);
  const { user } = useAuth();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBody, setEditBody] = useState('');

  if (isLoading) return null;

  const handleEdit = (commentId: string, body: string) => {
    setEditingId(commentId);
    setEditBody(body);
  };

  const handleSaveEdit = async (commentId: string) => {
    if (!editBody.trim()) return;
    await editComment.mutateAsync({ commentId, body: editBody.trim() });
    setEditingId(null);
    setEditBody('');
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('このコメントを削除しますか？')) return;
    await deleteComment.mutateAsync(commentId);
  };

  return (
    <Box sx={{ mt: 2 }}>
      {comments.map((comment: any) => (
        <Stack key={comment.id} direction="row" spacing={1} sx={{ mb: 1.5 }}>
          <Avatar src={comment.profiles?.avatar_url ?? undefined} sx={{ width: 28, height: 28, mt: 0.5 }}>
            {comment.profiles?.display_name?.[0]}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            {editingId === comment.id ? (
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                <TextField
                  size="small"
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                  inputProps={{ maxLength: 200 }}
                  fullWidth
                />
                <Button size="small" onClick={() => handleSaveEdit(comment.id)}>
                  保存
                </Button>
                <Button size="small" onClick={() => setEditingId(null)}>
                  取消
                </Button>
              </Box>
            ) : (
              <>
                <Typography variant="body2">
                  <strong>{comment.profiles?.display_name}</strong>{' '}
                  {comment.body}
                </Typography>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="caption" color="text.secondary">
                    {formatRelativeTime(comment.created_at)}
                  </Typography>
                  {user?.id === comment.user_id && (
                    <>
                      <IconButton size="small" onClick={() => handleEdit(comment.id, comment.body)}>
                        <EditIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete(comment.id)}>
                        <DeleteIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </>
                  )}
                </Stack>
              </>
            )}
          </Box>
        </Stack>
      ))}
    </Box>
  );
}
