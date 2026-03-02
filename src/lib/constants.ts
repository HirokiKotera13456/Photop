// Storage
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const SIGNED_URL_EXPIRY = 3600; // 1 hour (seconds)
export const SIGNED_URL_STALE_TIME = 1000 * 60 * 30; // 30 minutes (ms)

// Pagination
export const FEED_PAGE_SIZE = 10;

// Image compression
export const MAX_IMAGE_DIMENSION = 1920;
export const IMAGE_COMPRESSION_QUALITY = 0.8;

// Query keys
export const QUERY_KEYS = {
  photos: {
    feed: (userId?: string) => ['photos', 'feed', userId] as const,
    detail: (photoId?: string) => ['photos', 'detail', photoId] as const,
  },
  photoUrl: (path?: string) => ['photo-url', path] as const,
  monthlyBest: {
    photos: (userId?: string, month?: string) => ['my-photos-month', userId, month] as const,
    selection: (userId?: string, month?: string) => ['my-best-selection', userId, month] as const,
  },
  archive: (userId?: string) => ['archive', userId] as const,
  profile: (userId?: string) => ['profile', userId] as const,
} as const;
