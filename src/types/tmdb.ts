export interface TMDBGenre {
  id: number;
  name: string;
}

export interface TMDBBase {
  id: number;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  vote_average: number;
  genres?: TMDBGenre[];
}

export interface TMDBMovie extends TMDBBase {
  title: string;
  original_title?: string;
  release_date: string;
  runtime?: number;
}

export interface TMDBTV extends TMDBBase {
  name: string;
  original_name?: string;
  first_air_date: string;
  number_of_seasons?: number;
  seasons?: TMDBSeason[];
}

export interface TMDBSeason {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  season_number: number;
  episode_count?: number;
  episodes?: TMDBEpisode[];
}

export interface TMDBEpisode {
  id: number;
  name: string;
  overview: string;
  air_date: string;
  episode_number: number;
  season_number: number;
  still_path: string | null;
  vote_average: number;
}

export interface TMDBTrendingItem extends TMDBBase {
  media_type: "movie" | "tv";
  title?: string;
  name?: string;
  original_title?: string;
  original_name?: string;
  release_date?: string;
  first_air_date?: string;
}

export interface TMDBResponse<T> {
  results: T[];
  page: number;
  total_pages: number;
  total_results: number;
}
