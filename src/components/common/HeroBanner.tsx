import { Play, Info } from "lucide-react";
import type { MediaItem } from "@/lib/normalizeMedia";

interface HeroBannerProps {
  movie?: MediaItem | null;
}

export function HeroBanner({ movie }: HeroBannerProps) {
  if (!movie) {
    return <div className="h-[70vh] w-full bg-gray-900 animate-pulse" />;
  }

  const backdropUrl = movie.backdropUrl;

  return (
    <div className="relative h-[70vh] w-full">
      {/* Background Image Container */}
      <div className="absolute inset-0">
        <img
          src={backdropUrl}
          alt={movie.title}
          className="h-full w-full object-cover object-center"
        />
...
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col justify-end px-6 pb-20 md:px-10 lg:pb-32 w-full md:w-2/3 lg:w-1/2">
        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 drop-shadow-lg">
          {movie.title}
        </h1>
        <p className="text-sm md:text-lg text-gray-300 mb-6 drop-shadow-md line-clamp-3">
          {movie.overview}
        </p>

        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 rounded bg-white px-6 py-2 md:py-3 text-sm md:text-base font-bold text-black transition-opacity hover:opacity-80">
            <Play className="h-5 w-5 fill-black" />
            Play
          </button>
          <button className="flex items-center gap-2 rounded bg-gray-500/70 px-6 py-2 md:py-3 text-sm md:text-base font-bold text-white transition-colors hover:bg-gray-500/50">
            <Info className="h-5 w-5" />
            More Info
          </button>
        </div>
      </div>
    </div>
  );
}
