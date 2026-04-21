import { NextRequest } from "next/server";
import { getMediaById } from "@/services/mediaService";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { safeHandler } from "@/lib/apiResponse";

export const runtime = "edge";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return safeHandler(async () => {
    const { id } = await params;
    const { env } = getRequestContext();
    
    if (!id) throw new Error("TV ID is required");
    if (!env.DB) throw new Error("Database binding missing");

    return await getMediaById(id, "tv", env.DB);
  });
}
