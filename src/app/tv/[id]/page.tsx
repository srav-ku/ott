import { getTVDetails, getTVRecommendations, getTVSeason, Episode } from "@/lib/tmdb";
import { ContentRow } from "@/components/common/ContentRow";
import { Play, Plus, ChevronDown } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const tv = await getTVDetails(id);
  return {
    title: tv ? `${tv.title} - OTT` : "TV Detail",
  };
}

export default async function TVDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tv = await getTVDetails(id);

  if (!tv) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">TV Show Not Found</h1>
          <Link href="/" className="text-blue-500 hover:underline">Return to Home</Link>
        </div>
      </div>
    );
  }

  const recommendations = await getTVRecommendations(id);
  
  // Fetch episodes for each season in parallel with safety
  const seasonResults = await Promise.allSettled(
    (tv.seasons || []).map((season) => getTVSeason(id, season.season_number))
  );

  const seasonsWithEpisodes = seasonResults.map((result, index) => {
    if (result.status === "fulfilled" && result.value) {
      return result.value;
    }
    // Fallback to original season data from the main TV request
    return tv.seasons![index];
  });
  
  const backdropUrl = tv.backdrop_path 
    ? `https://image.tmdb.org/t/p/original${tv.backdrop_path}`
    : "/placeholder-backdrop.jpg";
    
  const year = tv.first_air_date ? new Date(tv.first_air_date).getFullYear() : "N/A";
  const rating = tv.vote_average ? tv.vote_average.toFixed(1) : "N/A";
  const seasonsCount = tv.number_of_seasons || 0;

  return (
    <div className="flex min-h-screen flex-col bg-[#0a0a0a] pb-20">
      {/* 1. Top Hero Section */}
      <div className="relative h-[75vh] w-full overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={backdropUrl}
            alt={tv.title}
            className="h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/20 to-transparent" />
        </div>

        <div className="relative h-full flex flex-col justify-end px-6 pb-16 md:px-12 lg:pb-24 w-full md:w-3/4 lg:w-2/3">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-4 drop-shadow-2xl">
            {tv.title}
          </h1>
          
          <div className="flex items-center gap-4 text-sm md:text-lg font-semibold text-gray-200 mb-6 drop-shadow-md">
            <span className="text-green-400">{rating} Rating</span>
            <span>{year}</span>
            <span>{seasonsCount} Season{seasonsCount !== 1 ? "s" : ""}</span>
          </div>
          
          <p className="text-base md:text-xl text-gray-300 mb-8 drop-shadow-md line-clamp-3 md:line-clamp-4 max-w-2xl leading-relaxed">
            {tv.overview}
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
          {tv.genres?.map((g) => (
            <span 
              key={g.id} 
              className="rounded-full bg-white/10 backdrop-blur-sm border border-white/10 px-4 py-1.5 text-xs md:text-sm text-gray-200 font-medium transition-colors hover:bg-white/20"
            >
              {g.name}
            </span>
          ))}
        </div>
      </div>

      {/* 3. TV Seasons & Episodes */}
      {seasonsWithEpisodes.length > 0 && (
        <div className="px-6 md:px-12 mb-16 relative z-20">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 border-l-4 border-red-600 pl-4">Episodes</h2>
          <div className="space-y-4 max-w-5xl">
            {seasonsWithEpisodes.map((season) => {
              if (season.season_number === 0) return null;
              return (
                <details key={season.id} className="group bg-white/5 border border-white/10 rounded-xl overflow-hidden transition-all duration-300 open:bg-white/10">
                  <summary className="flex cursor-pointer items-center justify-between p-5 md:p-6 font-bold text-lg md:text-xl text-white hover:bg-white/10 transition-colors list-none">
                    <div className="flex items-center gap-4">
                      <span className="text-red-500">{season.season_number}</span>
                      <span>{season.name}</span>
                      <span className="text-sm font-normal text-gray-400">({season.episodes?.length || season.episode_count || 0} Episodes)</span>
                    </div>
                    <ChevronDown className="h-6 w-6 text-gray-400 transition-transform duration-300 group-open:rotate-180" />
                  </summary>
                  <div className="px-5 md:px-6 pb-6 space-y-4">
                    {season.overview && (
                      <p className="text-sm md:text-base text-gray-400 mb-6 italic">{season.overview}</p>
                    )}
                    <div className="grid gap-3">
                      {season.episodes?.map((episode: Episode) => (
                        <div 
                          key={episode.id} 
                          className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/5"
                        >
                          <span className="text-gray-500 font-mono w-8 text-right">{episode.episode_number}</span>
                          <div className="flex-1">
                            <h4 className="text-white font-semibold text-sm md:text-base">{episode.name}</h4>
                            <p className="text-xs text-gray-500 line-clamp-1">{episode.overview}</p>
                          </div>
                          <div className="hidden sm:block text-xs text-gray-500">
                            {episode.air_date ? new Date(episode.air_date).toLocaleDateString() : ""}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </details>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Recommendations Section */}
      {recommendations && recommendations.length > 0 && (
        <div className="relative z-20 mt-12">
          <ContentRow title="More Like This" items={recommendations} fallbackMediaType="tv" />
        </div>
      )}
    </div>
  );
}
