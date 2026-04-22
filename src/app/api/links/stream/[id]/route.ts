import { NextRequest, NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { getDb } from "@/db";
import { movies, episodes } from "@/db/schema";
import { eq } from "drizzle-orm";

export const runtime = "edge";

function generateExtractedLink(type: "movie" | "episode", tmdbId: string, season?: number, episode?: number) {
  if (type === "movie") {
    return `https://vidsrc.me/embed/movie?tmdb=${tmdbId}`;
  } else {
    return `https://vidsrc.me/embed/tv?tmdb=${tmdbId}&season=${season}&ep=${episode}`;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { env } = getRequestContext();
    if (!env.DB) throw new Error("DB missing");

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // "movie" | "episode"
    
    const db = getDb(env.DB);
    let resolvedType = type;

    // 🔥 1. WATCH ROUTE SAFETY: Fallback detection
    if (!resolvedType || (resolvedType !== "movie" && resolvedType !== "episode")) {
      const isEpisode = await db.select().from(episodes).where(eq(episodes.id, parseInt(id))).get();
      if (isEpisode) {
        resolvedType = "episode";
      } else {
        const isMovie = await db.select().from(movies).where(eq(movies.tmdb_id, id)).get();
        if (isMovie) {
          resolvedType = "movie";
        } else {
          return NextResponse.json({ url: null }, { status: 400 });
        }
      }
    }

    const nowMs = Date.now();
    const now = new Date(nowMs);
    
    if (resolvedType === "movie") {
      const movieItem = await db.select().from(movies).where(eq(movies.tmdb_id, id)).get();
      if (!movieItem) {
        return NextResponse.json({ url: null }, { status: 404 });
      }

      // 1. Check primary stream url
      if (movieItem.primary_stream_url) {
        return NextResponse.json({
          url: movieItem.primary_stream_url,
          type: "direct"
        });
      }

      // 2. Check extracted stream url and expiry (🔥 3. EXPIRY RELIABILITY ISSUE FIX)
      if (
        movieItem.extracted_stream_url && 
        movieItem.stream_expires_at && 
        new Date(movieItem.stream_expires_at).getTime() > nowMs
      ) {
        return NextResponse.json({
          url: movieItem.extracted_stream_url,
          type: "extracted",
          expiresAt: movieItem.stream_expires_at
        });
      }

      // 3. Regenerate extracted link
      const newExtracted = generateExtractedLink("movie", movieItem.tmdb_id);
      const expiresAt = new Date(nowMs + 6 * 60 * 60 * 1000); // 6 hours

      await db.update(movies)
        .set({
          extracted_stream_url: newExtracted,
          stream_type: "extracted",
          stream_expires_at: expiresAt,
          stream_last_checked: now
        })
        .where(eq(movies.id, movieItem.id))
        .run();

      return NextResponse.json({
        url: newExtracted,
        type: "extracted",
        expiresAt
      });
    }

    if (resolvedType === "episode") {
      const epItem = await db.select().from(episodes).where(eq(episodes.id, parseInt(id))).get();
      if (!epItem) {
        return NextResponse.json({ url: null }, { status: 404 });
      }

      if (epItem.primary_stream_url) {
        return NextResponse.json({
          url: epItem.primary_stream_url,
          type: "direct"
        });
      }

      // 🔥 3. EXPIRY RELIABILITY ISSUE FIX
      if (
        epItem.extracted_stream_url && 
        epItem.stream_expires_at && 
        new Date(epItem.stream_expires_at).getTime() > nowMs
      ) {
        return NextResponse.json({
          url: epItem.extracted_stream_url,
          type: "extracted",
          expiresAt: epItem.stream_expires_at
        });
      }

      const newExtracted = generateExtractedLink("episode", epItem.tmdb_series_id, epItem.season_number, epItem.episode_number);
      const expiresAt = new Date(nowMs + 6 * 60 * 60 * 1000);

      await db.update(episodes)
        .set({
          extracted_stream_url: newExtracted,
          stream_type: "extracted",
          stream_expires_at: expiresAt,
          stream_last_checked: now
        })
        .where(eq(episodes.id, epItem.id))
        .run();

      return NextResponse.json({
        url: newExtracted,
        type: "extracted",
        expiresAt
      });
    }

  } catch (error) {
    console.error(error);
    return NextResponse.json({ url: null }, { status: 500 });
  }
}