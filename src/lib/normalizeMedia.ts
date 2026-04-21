import type { InferSelectModel } from "drizzle-orm";
import type { movies, episodes } from "@/db/schema";
import type {
  TMDBMovie,
  TMDBTV,
  TMDBSeason,
  TMDBEpisode,
  TMDBTrendingItem,
} from "@/types/tmdb";

// ─── Drizzle inferred row types ──────────────────────────────────────────────
type DBMovie = InferSelectModel<typeof movies>;
type DBEpisode = InferSelectModel<typeof episodes>;

// ─── TMDB image URL helpers (live here — NOT in UI) ──────────────────────────
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";
const FALLBACK_BACKDROP =
  "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070&auto=format&fit=crop";

export function tmdbPosterUrl(
  path: string | null,
  size: "w185" | "w342" | "w500" = "w500"
): string | null {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

export function tmdbBackdropUrl(
  path: string | null,
  size: "w780" | "w1280" | "original" = "original"
): string {
  if (!path) return FALLBACK_BACKDROP;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

// ─── Canonical MediaItem type ─────────────────────────────────────────────────
export type MediaItem = {
  id: string | number;
  title: string;
  type: "movie" | "tv";
  /** Raw TMDB poster path, e.g. /abc.jpg */
  poster: string | null;
  /** Full ready-to-use poster URL — UI should use this */
  posterUrl: string | null;
  /** Raw TMDB backdrop path */
  backdrop: string | null;
  /** Full ready-to-use backdrop URL — always defined (uses fallback) */
  backdropUrl: string;
  overview: string;
  rating: number | null;
  release_date?: string;
  runtime?: number;
  /** Genre names (mapped from TMDB genres array) */
  language?: string[];
  hasLinks?: boolean;
};

export type EpisodeItem = {
  id: number;
  name: string;
  overview: string;
  episode_number: number;
  season_number: number;
  still_path: string | null;
  /** Full ready-to-use still image URL */
  stillUrl: string | null;
  vote_average: number;
};

export type SeasonItem = {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  season_number: number;
  episodes: EpisodeItem[];
};

// ─── TMDB Normalizers ─────────────────────────────────────────────────────────

export function normalizeMovie(item: TMDBMovie): MediaItem {
  return {
    id: item.id,
    title: item.title || item.original_title || "Untitled",
    type: "movie",
    poster: item.poster_path,
    posterUrl: tmdbPosterUrl(item.poster_path),
    backdrop: item.backdrop_path,
    backdropUrl: tmdbBackdropUrl(item.backdrop_path),
    overview: item.overview || "",
    rating: item.vote_average ?? null,
    release_date: item.release_date,
    runtime: item.runtime,
    language: item.genres?.map((g) => g.name),
    hasLinks: false,
  };
}

export function normalizeTV(item: TMDBTV): MediaItem {
  return {
    id: item.id,
    title: item.name || item.original_name || "Untitled",
    type: "tv",
    poster: item.poster_path,
    posterUrl: tmdbPosterUrl(item.poster_path),
    backdrop: item.backdrop_path,
    backdropUrl: tmdbBackdropUrl(item.backdrop_path),
    overview: item.overview || "",
    rating: item.vote_average ?? null,
    release_date: item.first_air_date,
    language: item.genres?.map((g) => g.name),
    hasLinks: false,
  };
}

/**
 * Normalizes a TMDB trending item (which has optional title/name fields
 * and a media_type discriminator) into a canonical MediaItem.
 */
export function normalizeTrendingItem(item: TMDBTrendingItem): MediaItem {
  const isMovie = item.media_type === "movie";
  return {
    id: item.id,
    title:
      (isMovie ? item.title : item.name) ||
      (isMovie ? item.original_title : item.original_name) ||
      "Untitled",
    type: isMovie ? "movie" : "tv",
    poster: item.poster_path,
    posterUrl: tmdbPosterUrl(item.poster_path),
    backdrop: item.backdrop_path,
    backdropUrl: tmdbBackdropUrl(item.backdrop_path),
    overview: item.overview || "",
    rating: item.vote_average ?? null,
    release_date: isMovie ? item.release_date : item.first_air_date,
    language: item.genres?.map((g) => g.name),
    hasLinks: false,
  };
}

// ─── DB Normalizers ───────────────────────────────────────────────────────────

export function normalizeDBMovie(item: DBMovie): MediaItem {
  let languages: string[] | undefined;
  if (typeof item.available_languages === "string") {
    try {
      const parsed: unknown = JSON.parse(item.available_languages);
      if (Array.isArray(parsed)) {
        languages = parsed.filter((x): x is string => typeof x === "string");
      }
    } catch {
      languages = [];
    }
  }

  const type: "movie" | "tv" =
    item.type === "tv" ? "tv" : "movie";

  return {
    id: item.tmdb_id,
    title: item.title,
    type,
    poster: item.poster_path,
    posterUrl: tmdbPosterUrl(item.poster_path ?? null),
    backdrop: item.backdrop_path,
    backdropUrl: tmdbBackdropUrl(item.backdrop_path ?? null),
    overview: item.overview ?? "",
    rating: item.rating ?? null,
    language: languages,
    hasLinks: item.has_links ?? false,
  };
}

export function normalizeEpisode(item: TMDBEpisode): EpisodeItem {
  return {
    id: item.id,
    name: item.name || "Untitled",
    overview: item.overview || "",
    episode_number: item.episode_number,
    season_number: item.season_number,
    still_path: item.still_path,
    stillUrl: tmdbPosterUrl(item.still_path, "w342"),
    vote_average: item.vote_average,
  };
}

export function normalizeDBEpisode(item: DBEpisode): EpisodeItem {
  return {
    id: item.id,
    name: item.title,
    overview: item.overview ?? "",
    episode_number: item.episode_number,
    season_number: item.season_number,
    still_path: item.still_path ?? null,
    stillUrl: tmdbPosterUrl(item.still_path ?? null, "w342"),
    vote_average: item.vote_average ?? 0,
  };
}

export function normalizeSeason(item: TMDBSeason): SeasonItem {
  return {
    id: item.id,
    name: item.name || "Untitled",
    overview: item.overview || "",
    poster_path: item.poster_path,
    season_number: item.season_number,
    episodes: item.episodes?.map(normalizeEpisode) ?? [],
  };
}
