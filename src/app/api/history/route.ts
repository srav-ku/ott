import { NextRequest } from "next/server";
import { safeHandler } from "@/lib/apiResponse";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { getDb } from "@/db";
import { history } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getMediaById } from "@/services/mediaService";

export const runtime = "edge";

const getUserId = () => "anonymous-user-1";

export async function GET(request: NextRequest) {
  return safeHandler(request, async () => {
    const { env } = getRequestContext();
    if (!env.DB) throw new Error("DB missing");

    const userId = getUserId();
    const db = getDb(env.DB);

    const entries = await db.select()
      .from(history)
      .where(eq(history.user_id, userId))
      .orderBy(desc(history.last_watched))
      .limit(20)
      .all();
    
    // Enrich with media details
    const mediaItems = await Promise.all(
      entries.map(async (e) => {
        const media = await getMediaById(e.tmdb_id, e.type as "movie" | "tv", env.DB);
        return {
          ...media,
          progress: e.progress,
          last_watched: e.last_watched
        };
      })
    );

    return mediaItems.filter(m => m.title !== "Unavailable");
  });
}

export async function POST(request: NextRequest) {
  return safeHandler(request, async () => {
    const { env } = getRequestContext();
    if (!env.DB) throw new Error("DB missing");

    const body = await request.json() as { tmdbId: string, type: "movie" | "tv", progress: number };
    if (!body?.tmdbId || !body?.type || typeof body.progress !== "number") {
      throw new Error("tmdbId, type, and progress are required");
    }

    const userId = getUserId();
    const db = getDb(env.DB);

    // Warm cache
    await getMediaById(body.tmdbId, body.type, env.DB);

    await db.insert(history).values({
      user_id: userId,
      tmdb_id: body.tmdbId,
      type: body.type,
      progress: body.progress,
      last_watched: new Date()
    }).onConflictDoUpdate({
      target: [history.user_id, history.tmdb_id, history.type],
      set: {
        progress: body.progress,
        last_watched: new Date()
      }
    }).run();

    return { recorded: true };
  });
}
