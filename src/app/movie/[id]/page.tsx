import { getMovieDetails, getMovieRecommendations } from "@/lib/tmdb";
import { ContentRow } from "@/components/common/ContentRow";
import { Play, Plus } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const movie = await getMovieDetails(id);
  return {
    title: movie ? `${movie.title} - OTT` : "Movie Detail",
  };
}

export default async function MovieDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const movie = await getMovieDetails(id);

  if (!movie) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Movie Not Found</h1>
          <Link href="/" className="text-blue-500 hover:underline">Return to Home</Link>
        </div>
      </div>
    );
  }

  const recommendations = await getMovieRecommendations(id);
  
  const backdropUrl = movie.backdrop_path 
    ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
    : "/placeholder-backdrop.jpg";
    
  const year = movie.release_date ? new Date(movie.release_date).getFullYear() : "N/A";
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : "N/A";

  return (
    <div className="flex min-h-screen flex-col bg-[#0a0a0a] pb-20">
      {/* 1. Top Hero Section */}
      <div className="relative h-[75vh] w-full overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={backdropUrl}
            alt={movie.title}
            className="h-full w-full object-cover object-center"
          />
          {/* Dark gradient overlay (left → right + bottom fade) */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/20 to-transparent" />
        </div>

        <div className="relative h-full flex flex-col justify-end px-6 pb-16 md:px-12 lg:pb-24 w-full md:w-3/4 lg:w-2/3">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-4 drop-shadow-2xl">
            {movie.title}
          </h1>
          
          <div className="flex items-center gap-4 text-sm md:text-lg font-semibold text-gray-200 mb-6 drop-shadow-md">
            <span className="text-green-400">{rating} Rating</span>
            <span>{year}</span>
            {movie.runtime ? (
              <span>{Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span>
            ) : null}
          </div>
          
          <p className="text-base md:text-xl text-gray-300 mb-8 drop-shadow-md line-clamp-3 md:line-clamp-4 max-w-2xl leading-relaxed">
            {movie.overview}
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <button className="flex items-center gap-3 rounded bg-white px-8 py-3 text-sm md:text-lg font-bold text-black transition-all hover:bg-white/90 active:scale-95">
              <Play className="h-5 w-5 md:h-6 md:w-6 fill-black" />
              Play
            </button>
            <button className="flex items-center gap-3 rounded bg-gray-500/40 px-8 py-3 text-sm md:text-lg font-bold text-white backdrop-blur-md transition-all hover:bg-gray-500/50 active:scale-95">
              <Plus className="h-5 w-5 md:h-6 md:w-6" />
              Watchlist
            </button>
          </div>
        </div>
      </div>

      {/* 2. Info Section */}
      <div className="px-6 md:px-12 mb-16 -mt-8 relative z-10">
        <div className="flex flex-wrap gap-3">
          {movie.genres?.map((g) => (
            <span 
              key={g.id} 
              className="rounded-full bg-white/10 backdrop-blur-sm border border-white/10 px-4 py-1.5 text-xs md:text-sm text-gray-200 font-medium transition-colors hover:bg-white/20"
            >
              {g.name}
            </span>
          ))}
        </div>
      </div>

      {/* 4. Recommendations Section */}
      {recommendations && recommendations.length > 0 && (
        <div className="relative z-20">
          <ContentRow title="More Like This" items={recommendations} fallbackMediaType="movie" />
        </div>
      )}
    </div>
  );
}
