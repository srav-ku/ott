import { NextRequest } from "next/server";
import { getTVSeason } from "@/services/mediaService";
import { safeHandler } from "@/lib/apiResponse";
import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = "edge";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string, season: string }> }
) {
  return safeHandler(request, async () => {
    const { id, season } = await params;
    const { env } = getRequestContext();
    
    if (!id || !season) throw new Error("ID and Season are required");
    if (!env.DB) throw new Error("Database binding missing");

    return await getTVSeason(id, parseInt(season), env.DB);
  });
}
