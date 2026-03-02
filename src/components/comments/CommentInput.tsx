import { useState } from 'react';
import { Box, TextField, IconButton } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { useComments } from '@/src/hooks/useComments';

interface CommentInputProps {
  photoId: string;
}

export default function CommentInput({ photoId }: CommentInputProps) {
  const { addComment } = useComments(photoId);
  const [body, setBody] = useState('');

  const handleSubmit = async () => {
    const trimmed = body.trim();
    if (!trimmed) return;
    await addComment.mutateAsync(trimmed);
    setBody('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Box sx={{ display: 'flex', gap: 1, mt: 2, alignItems: 'flex-end' }}>
      <TextField
        placeholder="コメントを追加..."
        value={body}
        onChange={(e) => setBody(e.target.value)}
        onKeyDown={handleKeyDown}
        inputProps={{ maxLength: 200 }}
        fullWidth
        size="small"
      />
      <IconButton
        color="primary"
        onClick={handleSubmit}
        disabled={!body.trim() || addComment.isPending}
      >
        <SendIcon />
      </IconButton>
    </Box>
  );
}
