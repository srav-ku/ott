import { NextRequest } from "next/server";
import { getMediaList } from "@/services/mediaService";
import { safeHandler } from "@/lib/apiResponse";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  return safeHandler(request, async () => {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") as "trending" | "popular" | "top_rated" | "upcoming";
    const mediaType = (searchParams.get("mediaType") as "movie" | "tv") || "movie";

    if (!type) throw new Error("List type is required");

    return await getMediaList(type, mediaType);
  });
}
