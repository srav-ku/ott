import { D1Database } from "@cloudflare/workers-types";
import { getDb } from "@/db";
import { movies, episodes } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import {
  getMovieDetails,
  getTVDetails,
  getTrending,
  getPopularMovies,
  getTopRated,
  getUpcoming,
  getMovieRecommendations,
  getTVRecommendations,
  getTVSeason as fetchTVSeasonFromTMDB,
} from "@/lib/tmdb";
import {
  MediaItem,
  SeasonItem,
  normalizeMovie,
  normalizeTV,
  normalizeTrendingItem,
  normalizeDBMovie,
  normalizeSeason,
  normalizeDBEpisode,
} from "@/lib/normalizeMedia";
import { TMDBMovie, TMDBTV } from "@/types/tmdb";
import { logger } from "@/lib/logger";

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// ─────────────────────────────────────────────────────────────────────────────
// getMediaById — DB-first with TTL, TMDB fallback, fire-and-forget sync
// ─────────────────────────────────────────────────────────────────────────────
export async function getMediaById(
  id: string,
  type: "movie" | "tv",
  d1: D1Database
): Promise<MediaItem> {
  const db = getDb(d1);

  try {
    const existing = await db
      .select()
      .from(movies)
      .where(eq(movies.tmdb_id, id))
      .get();

    if (existing) {
      const ageMs = existing.last_updated
        ? Date.now() - existing.last_updated.getTime()
        : Infinity;
      const isStale = ageMs > CACHE_TTL_MS;

      if (!isStale) {
        logger.debug(`Cache hit for ${type} ${id}`);
        return normalizeDBMovie(existing);
      }
      logger.info(`Stale cache — refetching ${type}:${id}`);
    }

    // Fetch from TMDB with explicit type narrowing
    let rawData: TMDBMovie | TMDBTV | null = null;
    if (type === "movie") {
      rawData = await getMovieDetails(id);
    } else {
      rawData = await getTVDetails(id);
    }

    if (!rawData) {
      // Return stale data if available, otherwise fallback
      return existing ? normalizeDBMovie(existing) : getFallbackMedia(id, type);
    }

    // Narrow type before calling specific normalizer
    const normalized: MediaItem =
      type === "movie"
        ? normalizeMovie(rawData as TMDBMovie)
        : normalizeTV(rawData as TMDBTV);

    // Fire-and-forget background sync — never blocks response
    syncToDatabase(d1, normalized).catch((err) =>
      logger.error("Sync error in getMediaById", err)
    );

    return normalized;
  } catch (error) {
    logger.error(`getMediaById error (${type}:${id})`, error);
    return getFallbackMedia(id, type);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// getMediaList — TMDB list fetcher, always returns MediaItem[]
// ─────────────────────────────────────────────────────────────────────────────
type ListType = "trending" | "popular" | "top_rated" | "upcoming";

export async function getMediaList(
  listType: ListType,
  mediaType: "movie" | "tv" = "movie"
): Promise<MediaItem[]> {
  try {
    if (listType === "trending") {
      const trendingItems = await getTrending();
      return trendingItems
        .filter((item) =>
          mediaType === "movie"
            ? item.media_type === "movie"
            : item.media_type === "tv"
        )
        .map(normalizeTrendingItem);
    }

    if (mediaType === "movie") {
      let rawItems: TMDBMovie[] = [];
      switch (listType) {
        case "popular":   rawItems = await getPopularMovies(); break;
        case "top_rated": rawItems = await getTopRated();      break;
        case "upcoming":  rawItems = await getUpcoming();      break;
      }
      return rawItems.map(normalizeMovie);
    }

    // TV non-trending lists are not supported by this endpoint set
    logger.warn(`TV list type '${listType}' not supported — returning empty`);
    return [];
  } catch (error) {
    logger.error("getMediaList error", error);
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// getRecommendations — TMDB only (no DB caching for recommendations)
// ─────────────────────────────────────────────────────────────────────────────
export async function getRecommendations(
  id: string,
  type: "movie" | "tv"
): Promise<MediaItem[]> {
  try {
    if (type === "movie") {
      const items = await getMovieRecommendations(id);
      return items.map(normalizeMovie);
    } else {
      const items = await getTVRecommendations(id);
      return items.map(normalizeTV);
    }
  } catch (error) {
    logger.error("getRecommendations error", error);
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// getTVSeason — DB-first with TTL, TMDB fallback, fire-and-forget sync
// ─────────────────────────────────────────────────────────────────────────────
export async function getTVSeason(
  tvId: string,
  seasonNumber: number,
  d1: D1Database
): Promise<SeasonItem> {
  const db = getDb(d1);

  try {
    const dbEpisodes = await db
      .select()
      .from(episodes)
      .where(
        and(
          eq(episodes.tmdb_series_id, tvId),
          eq(episodes.season_number, seasonNumber)
        )
      )
      .all();

    if (dbEpisodes.length > 0) {
      const firstUpdated = dbEpisodes[0].last_updated;
      const ageMs = firstUpdated
        ? Date.now() - firstUpdated.getTime()
        : Infinity;
      const isStale = ageMs > CACHE_TTL_MS;

      if (!isStale) {
        logger.debug(`Cache hit for TV:${tvId} S${seasonNumber}`);
        return {
          id: 0, // Season entity not stored separately in DB
          name: `Season ${seasonNumber}`,
          overview: "",
          poster_path: null,
          season_number: seasonNumber,
          episodes: dbEpisodes.map(normalizeDBEpisode),
        };
      }
      logger.info(`Stale episode cache — refetching TV:${tvId} S${seasonNumber}`);
    }

    const rawSeason = await fetchTVSeasonFromTMDB(tvId, seasonNumber);
    if (!rawSeason) {
      throw new Error(`Season ${seasonNumber} for TV ${tvId} not found on TMDB`);
    }

    const normalized = normalizeSeason(rawSeason);

    // Fire-and-forget background sync
    syncEpisodesToDatabase(d1, tvId, normalized).catch((err) =>
      logger.error("Episode sync error", err)
    );

    return normalized;
  } catch (error) {
    logger.error(`getTVSeason error (TV:${tvId} S${seasonNumber})`, error);
    throw error; // Re-throw — caller (API route) will handle via safeHandler
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Private helpers
// ─────────────────────────────────────────────────────────────────────────────

export async function getTVAllSeasons(
  tvId: string,
  totalSeasons: number,
  d1: D1Database
): Promise<SeasonItem[]> {
  const promises: Promise<SeasonItem>[] = [];
  for (let i = 1; i <= totalSeasons; i++) {
    promises.push(getTVSeason(tvId, i, d1));
  }
  const results = await Promise.allSettled(promises);
  return results
    .filter((r): r is PromiseFulfilledResult<SeasonItem> => r.status === "fulfilled")
    .map(r => r.value);
}
// ─────────────────────────────────────────────────────────────────────────────

async function syncToDatabase(d1: D1Database, item: MediaItem): Promise<void> {
  const db = getDb(d1);
  const row = {
    tmdb_id:             String(item.id),
    title:               item.title,
    type:                item.type,
    poster_path:         item.poster,
    backdrop_path:       item.backdrop,
    overview:            item.overview,
    rating:              item.rating,
    last_updated:        new Date(),
    available_languages: JSON.stringify(item.language ?? []),
    has_links:           item.hasLinks ?? false,
    total_seasons:       item.total_seasons,
  };

  await db
    .insert(movies)
    .values(row)
    .onConflictDoUpdate({
      target: movies.tmdb_id,
      set: {
        title:               row.title,
        poster_path:         row.poster_path,
        backdrop_path:       row.backdrop_path,
        overview:            row.overview,
        rating:              row.rating,
        last_updated:        row.last_updated,
        available_languages: row.available_languages,
        total_seasons:       row.total_seasons,
      },
    })
    .run();
}

async function syncEpisodesToDatabase(
  d1: D1Database,
  tmdbSeriesId: string,
  season: SeasonItem
): Promise<void> {
  const db = getDb(d1);

  if (!season.episodes.length) return;

  try {
    for (const ep of season.episodes) {
      await db
        .insert(episodes)
        .values({
          tmdb_series_id: tmdbSeriesId,
          season_number: season.season_number,
          episode_number: ep.episode_number,
          title: ep.name,
          overview: ep.overview,
          still_path: ep.still_path,
          vote_average: ep.vote_average,
          last_updated: new Date(),
        })
        .onConflictDoUpdate({
          target: [
            episodes.tmdb_series_id,
            episodes.season_number,
            episodes.episode_number,
          ],
          set: {
            title: ep.name,
            overview: ep.overview,
            still_path: ep.still_path,
            vote_average: ep.vote_average,
            last_updated: new Date(),
          },
        })
        .run();
    }
  } catch (error) {
    logger.error("Episode sync failed", error);
  }
}

function getFallbackMedia(id: string | number, type: "movie" | "tv"): MediaItem {
  return {
    id,
    title:       "Unavailable",
    type,
    poster:      null,
    posterUrl:   null,
    backdrop:    null,
    backdropUrl: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070&auto=format&fit=crop",
    overview:    "Content is temporarily unavailable.",
    rating:      null,
    language:    [],
    hasLinks:    false,
  };
}
