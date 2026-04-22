import { getRequestContext } from "@cloudflare/next-on-pages";
import { getDb } from "@/db";
import { watchlist } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getMediaById } from "@/services/mediaService";
import { ContentRow } from "@/components/common/ContentRow";
import { AlertCircle } from "lucide-react";

export const runtime = "edge";

export default async function WatchlistPage() {
  const { env } = getRequestContext();
  if (!env.DB) return <div>Database error</div>;

  const userId = "anonymous-user-1";
  const db = getDb(env.DB);

  const entries = await db.select().from(watchlist).where(eq(watchlist.user_id, userId)).all();
  
  const mediaItems = await Promise.all(
    entries.map(e => getMediaById(e.tmdb_id, e.type as "movie" | "tv", env.DB))
  );

  const validItems = mediaItems.filter(m => m.title !== "Unavailable");

  return (
    <div className="flex min-h-screen flex-col bg-[#0a0a0a] pt-24 pb-20">
      <div className="px-6 md:px-12 mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">My Watchlist</h1>
        <p className="text-gray-400">Movies and TV shows you saved to watch later.</p>
      </div>

      {validItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 text-gray-500">
          <AlertCircle className="h-16 w-16 mb-4 opacity-50" />
          <p className="text-xl">Your watchlist is empty</p>
        </div>
      ) : (
        <ContentRow title="Saved Items" items={validItems} />
      )}
    </div>
  );
}
