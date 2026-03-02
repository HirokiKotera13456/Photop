import { useMemo, useState } from 'react';
import { Container, Typography, Box, CircularProgress } from '@mui/material';
import Layout from '@/src/components/layout/Layout';
import AuthGuard from '@/src/components/layout/AuthGuard';
import ArchiveCard from '@/src/components/archive/ArchiveCard';
import MonthNavigator from '@/src/components/archive/MonthNavigator';
import { useArchive } from '@/src/hooks/useArchive';
import type { ArchiveItem } from '@/src/hooks/useArchive';

function ArchiveContent() {
  const { archive, isLoading } = useArchive();
  const [monthIndex, setMonthIndex] = useState(0);

  const months = useMemo(() => {
    const set = new Set<string>();
    for (const item of archive) {
      set.add(item.month);
    }
    return Array.from(set);
  }, [archive]);

  const currentMonthBest = useMemo(() => {
    if (months.length === 0) return null;
    return archive.find((item: ArchiveItem) => item.month === months[monthIndex]) ?? null;
  }, [archive, months, monthIndex]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ pt: 2, pb: 4 }}>
        <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
          アーカイブ
        </Typography>

        {months.length === 0 ? (
          <Typography color="text.secondary" textAlign="center" sx={{ py: 6 }}>
            まだ確定されたベストはありません
          </Typography>
        ) : (
          <>
            <MonthNavigator
              months={months}
              currentIndex={monthIndex}
              onChange={setMonthIndex}
            />
            {currentMonthBest && (
              <ArchiveCard month={months[monthIndex]} best={currentMonthBest} />
            )}
          </>
        )}
      </Box>
    </Container>
  );
}

export default function ArchivePage() {
  return (
    <AuthGuard>
      <Layout>
        <ArchiveContent />
      </Layout>
    </AuthGuard>
  );
}
