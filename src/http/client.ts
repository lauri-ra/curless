import { ResponseData } from "../utils/types.ts";

/**
 * Wrapper around Deno.fetch, adds middleware/logging
 * @param request The request object to execute.
 * @returns A Promise that resolves to the Response.
 */
export async function executeRequest(request: Request): Promise<ResponseData> {
  // TODO: optional logging with a flag.

  const start = performance.now();
  const response = await fetch(request);
  const end = performance.now();
  const duration = end - start;

  return { response, duration };
}
