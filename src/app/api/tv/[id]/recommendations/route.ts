import { NextRequest } from "next/server";
import { getRecommendations } from "@/services/mediaService";
import { safeHandler } from "@/lib/apiResponse";

export const runtime = "edge";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return safeHandler(request, async () => {
    const { id } = await params;
    if (!id) throw new Error("ID is required");

    return await getRecommendations(id, "tv");
  });
}
