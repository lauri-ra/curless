import { formatResponse } from '../output/response_formatter.ts';
import { ResponseData } from '../utils/types.ts';

/**
 * Handles and parses the response
 */
export async function handleResponse(
  request: Request,
  responseData: ResponseData,
  verbose: boolean,
) {
  const { response } = responseData;

  if (!response.ok) {
    const options = { showHeaders: false, showBody: false, verbose };
    return formatResponse(request, responseData, options);
  }

  const options = { showHeaders: true, showBody: true, verbose };
  return await formatResponse(request, responseData, options);
}
