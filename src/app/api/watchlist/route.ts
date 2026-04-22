import { NextRequest } from "next/server";
import { safeHandler } from "@/lib/apiResponse";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { getDb } from "@/db";
import { watchlist } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getMediaById } from "@/services/mediaService";

export const runtime = "edge";

// A mock user session ID for demonstration since there's no auth yet
const getUserId = () => "anonymous-user-1";

export async function GET(request: NextRequest) {
  return safeHandler(request, async () => {
    const { env } = getRequestContext();
    if (!env.DB) throw new Error("DB missing");

    const userId = getUserId();
    const db = getDb(env.DB);

    const entries = await db.select().from(watchlist).where(eq(watchlist.user_id, userId)).all();
    
    // Enrich with media details (we'll fetch from service to ensure cache is hot)
    const mediaItems = await Promise.all(
      entries.map(e => getMediaById(e.tmdb_id, e.type as "movie" | "tv", env.DB))
    );

    return mediaItems.filter(m => m.title !== "Unavailable");
  });
}

export async function POST(request: NextRequest) {
  return safeHandler(request, async () => {
    const { env } = getRequestContext();
    if (!env.DB) throw new Error("DB missing");

    const body = await request.json() as { tmdbId: string, type: "movie" | "tv" };
    if (!body?.tmdbId || !body?.type) throw new Error("tmdbId and type are required");

    const userId = getUserId();
    const db = getDb(env.DB);

    // Pre-fetch media to store it in local DB
    await getMediaById(body.tmdbId, body.type, env.DB);

    await db.insert(watchlist).values({
      user_id: userId,
      tmdb_id: body.tmdbId,
      type: body.type,
    }).onConflictDoNothing().run();

    return { added: true };
  });
}

export async function DELETE(request: NextRequest) {
  return safeHandler(request, async () => {
    const { env } = getRequestContext();
    if (!env.DB) throw new Error("DB missing");

    const body = await request.json() as { tmdbId: string, type: "movie" | "tv" };
    if (!body?.tmdbId || !body?.type) throw new Error("tmdbId and type are required");

    const userId = getUserId();
    const db = getDb(env.DB);

    await db.delete(watchlist).where(
      and(
        eq(watchlist.user_id, userId),
        eq(watchlist.tmdb_id, body.tmdbId),
        eq(watchlist.type, body.type)
      )
    ).run();

    return { removed: true };
  });
}
