import { useMemo, useState } from 'react';
import { Container, Typography, Box, CircularProgress } from '@mui/material';
import Layout from '@/src/components/layout/Layout';
import AuthGuard from '@/src/components/layout/AuthGuard';
import ArchiveCard from '@/src/components/archive/ArchiveCard';
import MonthNavigator from '@/src/components/archive/MonthNavigator';
import { useArchive } from '@/src/hooks/useArchive';

function ArchiveContent() {
  const { archive, isLoading } = useArchive();
  const [monthIndex, setMonthIndex] = useState(0);

  const groupedByMonth = useMemo(() => {
    const map = new Map<string, any[]>();
    for (const item of archive as any[]) {
      const existing = map.get(item.month) ?? [];
      existing.push(item);
      map.set(item.month, existing);
    }
    return map;
  }, [archive]);

  const months = useMemo(() => Array.from(groupedByMonth.keys()), [groupedByMonth]);

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
            {months[monthIndex] && (
              <ArchiveCard
                month={months[monthIndex]}
                bests={(groupedByMonth.get(months[monthIndex]) ?? []) as any}
              />
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
