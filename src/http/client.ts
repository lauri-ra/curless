import { ResponseData } from "../utils/types.ts";
import { CurlessError } from "../utils/errors.ts";

/**
 * Wrapper around Deno.fetch, adds middleware/logging
 * @param request The request object to execute.
 * @returns A Promise that resolves to the Response.
 */
export async function executeRequest(request: Request): Promise<ResponseData> {
  const start = performance.now();
  let response: Response;

  try {
    response = await fetch(request);
  } catch (error) {
    throw new CurlessError(
      "NETWORK_FAILURE",
      "network",
      error instanceof Error ? error.message : String(error),
      { cause: error, details: { url: request.url, method: request.method } },
    );
  }

  const end = performance.now();
  const duration = end - start;

  return { response, duration };
}
