import { Box, Avatar, Typography, Stack } from '@mui/material';

interface ProfileHeaderProps {
  profile: {
    display_name: string;
    avatar_url: string | null;
  };
  photoCount: number;
}

export default function ProfileHeader({ profile, photoCount }: ProfileHeaderProps) {
  return (
    <Box sx={{ textAlign: 'center', py: 3 }}>
      <Avatar
        src={profile.avatar_url ?? undefined}
        sx={{ width: 80, height: 80, mx: 'auto', mb: 1, fontSize: 32 }}
      >
        {profile.display_name[0]}
      </Avatar>
      <Typography variant="h6" fontWeight="bold">
        {profile.display_name}
      </Typography>
      <Stack direction="row" justifyContent="center" spacing={3} sx={{ mt: 1 }}>
        <Box textAlign="center">
          <Typography variant="h6" fontWeight="bold">
            {photoCount}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            投稿
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}
