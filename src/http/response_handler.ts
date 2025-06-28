import { formatResponse } from "../output/response_formatter.ts";
import { ResponseData } from "../utils/types.ts";

/**
 * Handles and parses the response
 */
export async function handleResponse(
  request: Request,
  responseData: ResponseData,
) {
  const { response } = responseData;

  if (!response.ok) {
    console.error(
      `Error: Request failed with status ${response.status}: (${response.statusText})`,
    );
  }

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    await formatResponse(request, responseData);
    return;
  }

  // TODO: handle other content types.
}
