import { 
  TMDBMovie, 
  TMDBTV, 
  TMDBSeason, 
  TMDBTrendingItem, 
  TMDBResponse 
} from "@/types/tmdb";
import { logger } from "./logger";

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class TMDBError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = "TMDBError";
  }
}

/**
 * Robust fetch wrapper for TMDB with exponential backoff and timeouts
 */
async function fetchFromTMDB<T>(endpoint: string, retries = 2): Promise<T | null> {
  if (!TMDB_API_KEY) {
    logger.error("TMDB API Key missing");
    return null;
  }

  const controller = new AbortController();
  // Aggressive timeout for external calls to ensure system doesn't hang
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const separator = endpoint.includes('?') ? '&' : '?';
    const url = `${BASE_URL}${endpoint}${separator}api_key=${TMDB_API_KEY}`;
    
    // We rely entirely on our Cloudflare D1 database for caching.
    // NextJS native fetch caching is notoriously buggy in local edge dev environments.
    const response = await fetch(url, {
      cache: 'no-store',
      signal: controller.signal
    });

    if (!response.ok) {
      if (response.status === 404) {
        logger.info(`TMDB Resource not found: ${endpoint}`);
        return null; // Graceful degradation for 404s
      }
      
      // Rates limits (429) should definitely trigger retries
      throw new TMDBError(`TMDB API Error: ${response.statusText}`, response.status);
    }

    return await response.json() as T;
  } catch (error: unknown) {
    const isTimeout = error instanceof DOMException && error.name === 'AbortError';
    const errorMessage = isTimeout ? 'Request timed out' : (error instanceof Error ? error.message : String(error));
    const status = error instanceof TMDBError ? error.status : undefined;
    
    if (retries > 0 && (!status || status === 429 || status >= 500 || isTimeout)) {
      const waitTime = isTimeout ? 500 : (status === 429 ? 1500 : 800);
      logger.warn(`TMDB fetch failed, retrying in ${waitTime}ms...`, { endpoint, errorMessage, retriesLeft: retries - 1 });
      await sleep(waitTime);
      return fetchFromTMDB<T>(endpoint, retries - 1);
    }
    
    logger.error(`Failed to fetch from TMDB after all retries`, error, { endpoint });
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function fetchListFromTMDB<T>(endpoint: string): Promise<T[]> {
  const data = await fetchFromTMDB<TMDBResponse<T>>(endpoint);
  return data?.results || [];
}

export const getTrending = () => fetchListFromTMDB<TMDBTrendingItem>("/trending/all/day");
export const getPopularMovies = () => fetchListFromTMDB<TMDBMovie>("/movie/popular");
export const getTopRated = () => fetchListFromTMDB<TMDBMovie>("/movie/top_rated");
export const getUpcoming = () => fetchListFromTMDB<TMDBMovie>("/movie/upcoming");

export const getMovieRecommendations = (id: string | number) => fetchListFromTMDB<TMDBMovie>(`/movie/${id}/recommendations`);
export const getTVRecommendations = (id: string | number) => fetchListFromTMDB<TMDBTV>(`/tv/${id}/recommendations`);

export async function getMovieDetails(id: string | number): Promise<TMDBMovie | null> {
  return await fetchFromTMDB<TMDBMovie>(`/movie/${id}`);
}

export async function getTVDetails(id: string | number): Promise<TMDBTV | null> {
  return await fetchFromTMDB<TMDBTV>(`/tv/${id}`);
}

export async function getTVSeason(tvId: string | number, seasonNumber: number): Promise<TMDBSeason | null> {
  return await fetchFromTMDB<TMDBSeason>(`/tv/${tvId}/season/${seasonNumber}`);
}
