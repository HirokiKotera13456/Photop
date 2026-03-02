import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SettingsIcon from '@mui/icons-material/Settings';

const navItems = [
  { label: 'フィード', icon: <HomeIcon />, path: '/feed' },
  { label: '投稿', icon: <AddAPhotoIcon />, path: '/post' },
  { label: 'ベスト', icon: <EmojiEventsIcon />, path: '/best' },
  { label: '設定', icon: <SettingsIcon />, path: '/settings' },
];

export default function BottomNav() {
  const router = useRouter();
  const [value, setValue] = useState(0);

  useEffect(() => {
    const index = navItems.findIndex((item) => router.pathname.startsWith(item.path));
    if (index !== -1) setValue(index);
  }, [router.pathname]);

  return (
    <Paper
      sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000 }}
      elevation={3}
    >
      <BottomNavigation
        value={value}
        onChange={(_, newValue) => {
          setValue(newValue);
          router.push(navItems[newValue].path);
        }}
        showLabels
      >
        {navItems.map((item) => (
          <BottomNavigationAction
            key={item.path}
            label={item.label}
            icon={item.icon}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
}
