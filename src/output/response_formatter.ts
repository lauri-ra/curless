import * as colors from '@std/fmt/colors';
import { ResponseData, FormatOptions } from '../utils/types.ts';

// Object for storing formatter function flows based on content-type keys.
const bodyFormatter: {
  [key: string]: (response: Response) => Promise<string>;
} = {
  'application/json': async (response) => {
    const body = await response.json();
    const jsonString = JSON.stringify(body, null, 2);
    return colorizeJSON(jsonString);
  },
  'application/xml': async (response) => {
    const xmlString = await response.text();
    return formatAndColorizeXml(xmlString);
  },
  'text/xml': async (response) => {
    const xmlString = await response.text();
    return formatAndColorizeXml(xmlString);
  },
  default: (response) => response.text(),
};

/**
 * Prints the response body. Picks the correct formatter based
 * on the response content type and logs it.
 * @param response
 */
async function printBody(response: Response) {
  console.log(colors.bold(colors.cyan('Body')));
  const contentType = response.headers.get('content-type');

  const formatterKey = Object.keys(bodyFormatter).find((key) =>
    contentType?.includes(key),
  );

  const formatter = bodyFormatter[formatterKey || 'default'];
  const formatterBody = await formatter(response);

  console.log(formatterBody);
  console.log('');
}

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

/**
 * Colorizes JSON keys and values.
 * @param jsonString
 * @returns colorized JSON string
 */
function colorizeJSON(jsonString: string): string {
  return jsonString
    .replace(/"([^"]+)":/g, colors.blue('"$1"') + ':') // Keys in blue
    .replace(/: "([^"]*)"/g, ': ' + colors.green('"$1"')) // String values in green
    .replace(/: (\d+\.?\d*)/g, ': ' + colors.yellow('$1')) // Numbers in yellow
    .replace(/: (true|false|null)/g, ': ' + colors.magenta('$1')); // Booleans/null in magenta
}

/**
 * Prints useful info combined from request & response data.
 * @param request
 * @param responseData
 */
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
 * Function parses, formats and applies some coloring
 * to the passed in XML string using regex magic.
 * @param xmlString
 * @returns formatted and very nicely colored xml string
 */
function formatAndColorizeXml(xmlString: string): string {
  let formattedXml = '';
  let indentLevel = 0;

  // Remove the XML declaration to simplify the parsing a little bit.
  const declarationMatch = xmlString.match(/<\?xml[^>]*\?>\s*/);
  const declaration = declarationMatch ? declarationMatch[0] : '';
  const xmlBody = xmlString.replace(declaration, '').trim();

  // Remove whitespace between tags to make splitting consistent.
  const compactedXml = xmlBody.replace(/>\s*</g, '><');
  // Split the XML into parts based on tags / rows.
  const xmlParts = compactedXml.split(/>\s*</);

  // Handle the first and last parts which may sometimes have extra angle brackets.
  if (xmlParts.length > 0) {
    if (xmlParts[0].startsWith('<')) {
      xmlParts[0] = xmlParts[0].substring(1);
    }
    const lastIndex = xmlParts.length - 1;
    if (xmlParts[lastIndex].endsWith('>')) {
      xmlParts[lastIndex] = xmlParts[lastIndex].slice(0, -1);
    }
  }

  // Build the indented XML structure.
  for (const node of xmlParts) {
    // Decrease indent for closing tags (starts with / and any word).
    if (node.match(/^\/\w/)) {
      indentLevel--;
    }

    // Construct the row.
    const indent = '  '.repeat(indentLevel);
    formattedXml += `${indent}<${node}>\n`;

    // Increase indent for opening tags (matches opening tags that are not self closing).
    if (node.match(/^<?\w[^>]*[^\/]$/)) {
      indentLevel++;
    }
  }

  // Add the declaration row back.
  formattedXml = declaration.trim() + '\n' + formattedXml.trim();

  // Colorize the formatted XML string.
  const colorizedTags = formattedXml.replace(
    /<(\/?[^>]+)>/g, // this matches all tags.
    (_, tagContent) => {
      const parts = tagContent.split(' ');
      const tagName = parts.shift() || '';
      const attributes = parts.join(' ');

      // Colorize attributes (eg key="value")
      const colorizedAttrs = attributes.replace(
        /(\w+)=(".*?")/g, // matches key="value" pairs
        `${colors.yellow('$1')}=${colors.green('$2')}`,
      );

      return `<${colors.blue(tagName)}${colorizedAttrs}>`;
    },
  );

  // Colorize the text content within tags.
  const colorizedContent = colorizedTags.replace(
    />([^<]+)</g, // this matches content between tags
    `>${colors.white('$1')}<`,
  );

  return colorizedContent;
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
  const { showHeaders = false, showBody = false, verbose = false } = options;

  // Print request and status lines.
  printStatusLines(request, responseData);

  if (showHeaders) {
    // Print headers.
    console.log(colors.cyan(colors.bold('Headers')));
    for (const [key, value] of response.headers.entries()) {
      if (verbose || isImportantHeader(key)) {
        console.log(`   ${colors.dim(key)}: ${value}`);
      }
    }
    console.log('');
  }

  if (showBody) {
    await printBody(response);
  }
}

/**
 * Helper function for printing simple messages
 * @param type error | success
 * @param message
 * @returns Parses message based on passed in type.
 */
export function printMessage(type: 'error' | 'success', message: string) {
  return type === 'error'
    ? console.log(`${colors.red('✖')}` + ' ' + message)
    : console.log(`${colors.green('✔')}` + ' ' + message);
}
