import * as colors from '@std/fmt/colors';
import { ResponseData, FormatOptions } from '../utils/types.ts';

function getStatusColor(status: number) {
  if (status >= 200 && status < 300) return colors.green;
  if (status >= 300 && status < 400) return colors.yellow;
  if (status >= 400 && status < 500) return colors.red;
  if (status >= 500) return colors.brightRed;
  // Default to dim for unknown status codes.
  return colors.dim;
}

function isImportantHeader(headerKey: string) {
  const important = new Set([
    'content-type',
    'content-length',
    'authorization',
    'location',
    'date',
    'cache-control',
  ]);

  return important.has(headerKey);
}

function colorizeJSON(jsonString: string): string {
  return jsonString
    .replace(/"([^"]+)":/g, colors.blue('"$1"') + ':') // Keys in blue
    .replace(/: "([^"]*)"/g, ': ' + colors.green('"$1"')) // String values in green
    .replace(/: (\d+\.?\d*)/g, ': ' + colors.yellow('$1')) // Numbers in yellow
    .replace(/: (true|false|null)/g, ': ' + colors.magenta('$1')); // Booleans/null in magenta
}

function printStatusLines(request: Request, responseData: ResponseData) {
  const { response, duration } = responseData;

  const statusColor = getStatusColor(response.status);
  const statusIcon = response.ok ? colors.green('✔') : colors.red('✖');
  const statusLine = `> ${colors.cyan(colors.bold(request.method))} ${
    request.url
  }`;
  const statusInfo = `${statusIcon} ${statusColor(
    response.status.toString(),
  )} ${response.statusText}`;
  const durationLine = colors.dim(`${duration.toFixed(2)} (ms)`);

  console.log('');
  console.log(statusLine);
  console.log(statusInfo + '  ' + durationLine);
  console.log('');
}

/**
 * Main function for handling response formatting.
 * @param request
 * @param responseData
 * @param options
 * @returns Logs out request & response data-
 */
export async function formatResponse(
  request: Request,
  responseData: ResponseData,
  options: FormatOptions = {},
) {
  const { response } = responseData;
  const { showHeaders = false, showBody = false } = options;

  // Print request and status lines.
  printStatusLines(request, responseData);

  if (showHeaders) {
    // Print headers.
    console.log(colors.cyan(colors.bold('Headers')));
    for (const [key, value] of response.headers.entries()) {
      // TODO: print all/most when verbose flag is on.
      if (isImportantHeader(key)) {
        console.log(`   ${colors.dim(key)}: ${value}`);
      }
    }
    console.log('');
  }

  if (showBody) {
    // Print the JSON body.
    const body = await response.json();
    const jsonString = JSON.stringify(body, null, 2);
    const prettyJson = colorizeJSON(jsonString);
    console.log(colors.bold(colors.cyan('Body')));
    console.log(prettyJson);
    console.log('');
  }
}
