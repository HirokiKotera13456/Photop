import { useState, useRef } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  IconButton,
} from '@mui/material';
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';
import CloseIcon from '@mui/icons-material/Close';
import { usePhotos } from '@/src/hooks/usePhotos';
import { validateFileSize, validateMimeType } from '@/src/lib/utils';

export default function PostForm() {
  const { uploadPhoto } = usePhotos();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [error, setError] = useState('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!validateMimeType(selected.type)) {
      setError('JPEG、PNG、WebP形式の画像を選択してください');
      return;
    }
    if (!validateFileSize(selected.size)) {
      setError('ファイルサイズは10MB以下にしてください');
      return;
    }

    setError('');
    setFile(selected);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(selected);
  };

  const handleClear = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async () => {
    if (!file) return;
    setError('');
    try {
      await uploadPhoto.mutateAsync({ file, caption: caption || undefined });
      router.push('/feed');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '投稿に失敗しました';
      setError(msg);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {error && <Alert severity="error">{error}</Alert>}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        hidden
        onChange={handleFileSelect}
      />

      {!preview ? (
        <Box
          onClick={() => fileInputRef.current?.click()}
          sx={{
            border: '2px dashed',
            borderColor: 'grey.300',
            borderRadius: 2,
            p: 6,
            textAlign: 'center',
            cursor: 'pointer',
            '&:hover': { borderColor: 'primary.main', bgcolor: 'grey.50' },
          }}
        >
          <AddAPhotoIcon sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
          <Typography color="text.secondary">タップして写真を選択</Typography>
        </Box>
      ) : (
        <Box sx={{ position: 'relative' }}>
          <IconButton
            onClick={handleClear}
            sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(0,0,0,0.5)', color: 'white' }}
            size="small"
          >
            <CloseIcon />
          </IconButton>
          <Box
            component="img"
            src={preview}
            alt="プレビュー"
            sx={{ width: '100%', borderRadius: 2, maxHeight: 400, objectFit: 'cover' }}
          />
        </Box>
      )}

      <TextField
        label="キャプション"
        placeholder="写真について一言..."
        multiline
        rows={2}
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        inputProps={{ maxLength: 200 }}
        helperText={`${caption.length}/200`}
        fullWidth
      />

      <Button
        variant="contained"
        size="large"
        onClick={handleSubmit}
        disabled={!file || uploadPhoto.isPending}
        fullWidth
      >
        {uploadPhoto.isPending ? '投稿中...' : '投稿する'}
      </Button>
    </Box>
  );
}
