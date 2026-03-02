import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from './constants';

export function formatMonth(date?: Date | string): string {
  const d = date ? new Date(date) : new Date();
  return format(d, 'yyyy-MM');
}

export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'たった今';
  if (diffMin < 60) return `${diffMin}分前`;
  if (diffHour < 24) return `${diffHour}時間前`;
  if (diffDay < 7) return `${diffDay}日前`;
  return format(date, 'yyyy/MM/dd', { locale: ja });
}

export function formatDisplayMonth(month: string): string {
  const [year, m] = month.split('-');
  return `${year}年${parseInt(m)}月`;
}

export function validateFileSize(bytes: number): boolean {
  return bytes <= MAX_FILE_SIZE;
}

export function validateMimeType(type: string): boolean {
  return ALLOWED_MIME_TYPES.includes(type);
}

export function getStoragePath(userId: string, fileName: string): string {
  const timestamp = Date.now();
  const ext = fileName.split('.').pop();
  return `${userId}/${timestamp}.${ext}`;
}
