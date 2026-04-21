import { NextResponse } from "next/server";
import { ApiResponse } from "@/types/apiContract";

/**
 * Standardized success response utility.
 */
export function success<T>(
  data: T,
  meta?: Record<string, unknown>
): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    ...(meta ? { meta } : {}),
  });
}

/**
 * Standardized error response utility.
 */
export function error(
  message: string,
  status: number = 500
): NextResponse<ApiResponse<never>> {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status }
  );
}

/**
 * Safe API handler wrapper to catch async errors and standardize responses.
 */
export async function safeHandler<T>(
  fn: () => Promise<T>
): Promise<NextResponse<ApiResponse<T>>> {
  try {
    const data = await fn();
    return success(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    console.error(`[API Error]: ${message}`, err);
    return error(message);
  }
}
