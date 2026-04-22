import { NextRequest } from "next/server";
import { safeHandler } from "@/lib/apiResponse";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { getDb } from "@/db";
import { links, linkQueue, movies } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getMediaById } from "@/services/mediaService";
import { logger } from "@/lib/logger";

export const runtime = "edge";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ mediaId: string }> }
) {
  return safeHandler(request, async () => {
    const { env } = getRequestContext();
    if (!env.DB) throw new Error("DB missing");

    const { mediaId } = await params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") as "movie" | "tv";
    
    if (!type) throw new Error("media type is required");

    const db = getDb(env.DB);
    
    // Check if we have the movie in our DB locally to get its internal ID
    const localMedia = await db.select().from(movies).where(eq(movies.tmdb_id, mediaId)).get();
    
    if (localMedia && localMedia.has_links) {
      // Fetch links
      const mediaLinks = await db.select().from(links).where(eq(links.movie_id, localMedia.id)).all();
      if (mediaLinks.length > 0) return mediaLinks;
    }

    // Auto-Queue missing links
    logger.info(`Links missing for ${type}:${mediaId}, adding to queue`);
    const mediaItem = await getMediaById(mediaId, type, env.DB); // warms cache too
    
    await db.insert(linkQueue).values({
      tmdb_id: String(mediaId),
      title: mediaItem.title,
      type: type,
      status: 'pending',
      priority_score: 1,
    }).onConflictDoNothing().run();

    return []; // Return empty for now, admin must fulfill queue
  });
}
