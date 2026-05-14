import { ResponseData } from "../utils/types.ts";
import { CurlessError } from "../utils/errors.ts";

export const DEFAULT_TIMEOUT_SECONDS = 30;

export interface ExecuteOptions {
  timeoutSeconds?: number;
}

/**
 * Wrapper around fetch that adds a request-level timeout via AbortController.
 * Throws a TIMEOUT CurlessError when the timeout fires, and NETWORK_FAILURE
 * for any other fetch failure.
 */
export async function executeRequest(
  request: Request,
  options: ExecuteOptions = {},
): Promise<ResponseData> {
  const timeoutSeconds = options.timeoutSeconds ?? DEFAULT_TIMEOUT_SECONDS;
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutSeconds * 1000);

  const start = performance.now();
  let response: Response;

  try {
    response = await fetch(request, { signal: controller.signal });
  } catch (error) {
    if (timedOut) {
      throw new CurlessError(
        "TIMEOUT",
        "network",
        `Request timed out after ${timeoutSeconds}s. Pass --timeout to extend it.`,
        {
          cause: error,
          details: {
            url: request.url,
            method: request.method,
            timeoutSeconds,
          },
        },
      );
    }
    throw new CurlessError(
      "NETWORK_FAILURE",
      "network",
      error instanceof Error ? error.message : String(error),
      { cause: error, details: { url: request.url, method: request.method } },
    );
  } finally {
    clearTimeout(timer);
  }

  const end = performance.now();
  const duration = end - start;

  return { response, duration };
}
