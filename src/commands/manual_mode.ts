// Handles making the HTTP requests
import { ParsedCommands } from '../utils/types.ts';
import { executeRequest } from '../http/client.ts';
import { handleResponse } from '../http/response_handler.ts';
import { CurlessError } from '../utils/errors.ts';

function parseHeader(header: string): [string, string] {
  const separatorIndex = header.indexOf(':');
  if (separatorIndex <= 0 || separatorIndex === header.length - 1) {
    throw new CurlessError(
      'INVALID_HEADER',
      'user',
      `Invalid header '${header}'. Use the format Key:Value.`,
      { details: { header } },
    );
  }

  const key = header.slice(0, separatorIndex).trim();
  const value = header.slice(separatorIndex + 1).trim();

  if (!key || !value) {
    throw new CurlessError(
      'INVALID_HEADER',
      'user',
      `Invalid header '${header}'. Use the format Key:Value.`,
      { details: { header } },
    );
  }

  return [key, value];
}

/**
 * Handles parsing the request from user given commands
 * executing it and logging it to console.
 * @param commands
 */
export async function handleManualMode(commands: ParsedCommands) {
  // TODO: move to request builder
  // Extract method and URL
  const positionalArgs = commands._;
  const method = String(positionalArgs[0]).toUpperCase();
  const url = String(positionalArgs[1]);

  if (!positionalArgs[1]) {
    throw new CurlessError(
      'MANUAL_URL_MISSING',
      'user',
      'Manual mode requires a URL. Usage: curless GET https://example.com',
    );
  }

  try {
    new URL(url);
  } catch {
    throw new CurlessError(
      'MANUAL_URL_INVALID',
      'user',
      `Invalid URL '${url}'.`,
      { details: { url } },
    );
  }

  // Extract headers
  const requestHeaders = new Headers();
  for (const h of commands.header) {
    const [key, value] = parseHeader(h);
    requestHeaders.append(key, value);
  }

  // Create the request and include data.
  const request = new Request(url, {
    method,
    headers: requestHeaders,
    body: commands.data as string,
  });

  // Call HTTP request function
  const response = await executeRequest(request);
  return await handleResponse(request, response, commands.verbose);
}
