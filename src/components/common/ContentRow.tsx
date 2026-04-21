import { PosterCard } from "@/components/common/PosterCard";
import type { Movie } from "@/lib/tmdb";

interface ContentRowProps {
  title: string;
  items: Movie[];
  fallbackMediaType?: "movie" | "tv";
}

export function ContentRow({ title, items, fallbackMediaType = "movie" }: ContentRowProps) {
  if (!items || items.length === 0) return null;

  return (
    <div className="mb-8 px-6 md:px-10">
      <h2 className="text-xl md:text-2xl font-bold text-white mb-4">{title}</h2>
      
      {/* Horizontal Scroll Container */}
      <div className="flex gap-3 md:gap-4 overflow-x-auto pb-4 scrollbar-hide" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
        <style dangerouslySetInnerHTML={{__html: `
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}} />
        
        {items.map((item) => {
          if (!item.poster_path) return null;
          const type = item.media_type || fallbackMediaType;
          return (
            <div key={item.id} className="flex-none">
              <PosterCard 
                id={item.id}
                title={item.title} 
                image={`https://image.tmdb.org/t/p/w500${item.poster_path}`} 
                mediaType={type as "movie" | "tv"}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
