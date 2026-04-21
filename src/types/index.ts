export interface MediaItem {
  id: number;
  title: string;
  posterPath: string;
  backdropPath?: string;
  overview?: string;
  releaseDate?: string;
  voteAverage?: number;
}

export interface Section {
  title: string;
  items: MediaItem[];
}
