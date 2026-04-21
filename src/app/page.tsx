import { HeroBanner } from "@/components/common/HeroBanner";
import { ContentRow } from "@/components/common/ContentRow";
import {
  getTrending,
  getPopularMovies,
  getTopRated,
  getUpcoming,
} from "@/lib/tmdb";

export default async function Home() {
  const [trendingNow, popularMovies, topRated, newReleases] = await Promise.all([
    getTrending(),
    getPopularMovies(),
    getTopRated(),
    getUpcoming(),
  ]);

  // Use the first trending movie that has a backdrop
  const heroMovie = trendingNow.find((m) => m.backdrop_path) || trendingNow[0] || null;

  return (
    <div className="flex min-h-screen flex-col bg-[#0a0a0a] pb-20">
      {/* Hero Banner Section */}
      <HeroBanner movie={heroMovie} />

      {/* Content Rows Section */}
      <div className="-mt-16 md:-mt-24 relative z-20 flex flex-col gap-8 md:gap-12">
        <ContentRow title="Trending Now" items={trendingNow} />
        <ContentRow title="Popular Movies" items={popularMovies} />
        <ContentRow title="Top Rated" items={topRated} />
        <ContentRow title="New Releases" items={newReleases} />
      </div>
    </div>
  );
}
