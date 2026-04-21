import { 
  TMDBMovie, 
  TMDBTV, 
  TMDBSeason, 
  TMDBTrendingItem, 
  TMDBResponse 
} from "@/types/tmdb";

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchFromTMDB<T>(endpoint: string, retries = 2): Promise<T | null> {
  if (!TMDB_API_KEY) {
    console.error("TMDB API Key missing");
    return null;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 7000);

  try {
    const response = await fetch(`${BASE_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}api_key=${TMDB_API_KEY}`, {
      next: { revalidate: 3600 },
      signal: controller.signal
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`TMDB API Error: ${response.statusText}`);
    }

    return await response.json() as T;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (retries > 0) {
      await sleep(500);
      return fetchFromTMDB<T>(endpoint, retries - 1);
    }
    console.error(`Failed to fetch from TMDB [${endpoint}]:`, errorMessage);
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
