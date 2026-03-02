import { Stack, IconButton, Typography } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { formatDisplayMonth } from '@/src/lib/utils';

interface MonthNavigatorProps {
  months: string[];
  currentIndex: number;
  onChange: (index: number) => void;
}

export default function MonthNavigator({ months, currentIndex, onChange }: MonthNavigatorProps) {
  if (months.length === 0) return null;

  return (
    <Stack direction="row" alignItems="center" justifyContent="center" spacing={2} sx={{ mb: 2 }}>
      <IconButton
        onClick={() => onChange(currentIndex + 1)}
        disabled={currentIndex >= months.length - 1}
      >
        <ChevronLeftIcon />
      </IconButton>
      <Typography variant="h6" fontWeight="bold">
        {formatDisplayMonth(months[currentIndex])}
      </Typography>
      <IconButton
        onClick={() => onChange(currentIndex - 1)}
        disabled={currentIndex <= 0}
      >
        <ChevronRightIcon />
      </IconButton>
    </Stack>
  );
}
