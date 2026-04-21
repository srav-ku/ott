import { MediaItem, SeasonItem } from "@/lib/normalizeMedia";

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: Record<string, unknown>;
}

/**
 * Specialized response types for Media
 */
export type MediaApiResponse = ApiResponse<MediaItem>;
export type MediaListApiResponse = ApiResponse<MediaItem[]>;
export type SeasonApiResponse = ApiResponse<SeasonItem>;
