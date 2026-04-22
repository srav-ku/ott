import { NextResponse, NextRequest } from "next/server";
import { ApiResponse } from "@/types/apiContract";
import { logger } from "./logger";

/**
 * Standardized success response utility with caching headers.
 */
export function success<T>(
  data: T,
  meta?: Record<string, unknown>
): NextResponse<ApiResponse<T>> {
  const response = NextResponse.json({
    success: true,
    data,
    ...(meta ? { meta } : {}),
  });

  // Edge caching headers: 
  // Browser caches for 1 hour, CDN caches for 24 hours, serve stale while revalidating
  response.headers.set('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=43200, max-age=3600');
  
  return response;
}

/**
 * Standardized error response utility.
 */
export function error(
  message: string,
  status: number = 500
): NextResponse<ApiResponse<never>> {
  const response = NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status }
  );
  
  // Do not cache errors
  response.headers.set('Cache-Control', 'no-store, max-age=0');
  
  return response;
}

/**
 * Safe API handler wrapper to catch async errors, generate request IDs, 
 * provide structured logging, and standardize responses.
 */
export async function safeHandler<T>(
  request: NextRequest | null,
  fn: () => Promise<T>
): Promise<NextResponse<ApiResponse<T>>> {
  const requestId = crypto.randomUUID();
  const route = request ? new URL(request.url).pathname : "unknown_route";
  
  try {
    logger.debug(`Processing API request`, { requestId, route });
    const startTime = Date.now();
    
    const data = await fn();
    
    const durationMs = Date.now() - startTime;
    logger.info(`Request completed successfully`, { requestId, route, durationMs });
    
    return success(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    logger.error(`API Request Failed`, err, { requestId, route });
    return error(message);
  }
}
