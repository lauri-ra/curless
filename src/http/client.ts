/**
 * Wrapper around Deno.fetch, adds middleware/logging
 * @param request The request object to execute.
 * @returns A Promise that resolves to the Response.
 */
export async function executeRequest(request: Request): Promise<Response> {
  // TODO: optional logging with a flag.
  const response = await fetch(request);

  return response;
}
