import { HeroBanner } from "@/components/common/HeroBanner";
import { ContentRow } from "@/components/common/ContentRow";
import { MediaItem } from "@/lib/normalizeMedia";
import { getMediaList } from "@/services/mediaService";

export const runtime = "edge";

export default async function Home() {
  // We don't need env here currently
  // We can call service layer DIRECTLY from server components for better performance
  // No need for a full HTTP fetch to our own API if we have the service layer
  const [trendingNow, popularMovies, topRated, newReleases] = await Promise.all([
    getMediaList("trending"),
    getMediaList("popular"),
    getMediaList("top_rated"),
    getMediaList("upcoming"),
  ]);

  const heroMovie = trendingNow.find((m: MediaItem) => m.backdrop) || trendingNow[0] || null;

  return (
    <div className="flex min-h-screen flex-col bg-[#0a0a0a] pb-20">
      <HeroBanner movie={heroMovie} />
      <div className="-mt-16 md:-mt-24 relative z-20 flex flex-col gap-8 md:gap-12">
        <ContentRow title="Trending Now" items={trendingNow} />
        <ContentRow title="Popular Movies" items={popularMovies} />
        <ContentRow title="Top Rated" items={topRated} />
        <ContentRow title="New Releases" items={newReleases} />
      </div>
    </div>
  );
}
