const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

export interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  vote_average: number;
  media_type?: "movie" | "tv";
  release_date?: string;
  runtime?: number;
  genres?: { id: number; name: string }[];
}

export interface TVShow extends Movie {
  first_air_date?: string;
  number_of_seasons?: number;
  seasons?: Season[];
}

export interface Season {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  season_number: number;
  episode_count: number;
  episodes?: Episode[];
}

export interface Episode {
  id: number;
  name: string;
  overview: string;
  air_date: string;
  episode_number: number;
  season_number: number;
  still_path: string | null;
  vote_average: number;
}

interface TMDBResponseItem {
  id: number;
  title?: string;
  name?: string;
  original_name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  vote_average: number;
  media_type?: "movie" | "tv";
  release_date?: string;
  first_air_date?: string;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchFromTMDB(endpoint: string, retries = 2): Promise<unknown> {
  if (!TMDB_API_KEY) {
    console.error("TMDB API Key missing");
    return null;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 7000); // 7s timeout

  try {
    const response = await fetch(`${BASE_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}api_key=${TMDB_API_KEY}`, {
      next: { revalidate: 3600 },
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`TMDB API Error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (retries > 0) {
      await sleep(500);
      return fetchFromTMDB(endpoint, retries - 1);
    }
    console.error(`Failed to fetch from TMDB [${endpoint}]:`, errorMessage);
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function fetchListFromTMDB(endpoint: string): Promise<Movie[]> {
  const data = await fetchFromTMDB(endpoint) as { results: TMDBResponseItem[] } | null;
  if (!data || !data.results) return [];

  return data.results.map((item: TMDBResponseItem) => ({
    id: item.id,
    title: item.title || item.name || item.original_name || "Untitled",
    poster_path: item.poster_path,
    backdrop_path: item.backdrop_path,
    overview: item.overview,
    vote_average: item.vote_average,
    media_type: item.media_type,
    release_date: item.release_date || item.first_air_date,
  }));
}

export const getTrending = () => fetchListFromTMDB("/trending/all/day");
export const getPopularMovies = () => fetchListFromTMDB("/movie/popular");
export const getTopRated = () => fetchListFromTMDB("/movie/top_rated");
export const getUpcoming = () => fetchListFromTMDB("/movie/upcoming");
export const getTrendingTV = () => fetchListFromTMDB("/trending/tv/day");

export const getMovieRecommendations = (id: string | number) => fetchListFromTMDB(`/movie/${id}/recommendations`);
export const getTVRecommendations = (id: string | number) => fetchListFromTMDB(`/tv/${id}/recommendations`);

export async function getMovieDetails(id: string | number): Promise<Movie | null> {
  const data = await fetchFromTMDB(`/movie/${id}`) as any; // Cast locally for specific fields
  if (!data) return null;

  return {
    id: data.id,
    title: data.title,
    poster_path: data.poster_path,
    backdrop_path: data.backdrop_path,
    overview: data.overview,
    vote_average: data.vote_average,
    release_date: data.release_date,
    runtime: data.runtime,
    genres: data.genres,
    media_type: "movie",
  };
}

export async function getTVDetails(id: string | number): Promise<TVShow | null> {
  const data = await fetchFromTMDB(`/tv/${id}`) as any;
  if (!data) return null;

  return {
    id: data.id,
    title: data.name,
    poster_path: data.poster_path,
    backdrop_path: data.backdrop_path,
    overview: data.overview,
    vote_average: data.vote_average,
    first_air_date: data.first_air_date,
    number_of_seasons: data.number_of_seasons,
    genres: data.genres,
    seasons: data.seasons,
    media_type: "tv",
  };
}

export async function getTVSeason(tvId: string | number, seasonNumber: number): Promise<Season | null> {
  return await fetchFromTMDB(`/tv/${tvId}/season/${seasonNumber}`) as Season | null;
}
