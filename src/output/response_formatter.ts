import * as colors from "@std/fmt/colors";
import { ResponseData } from "../utils/types.ts";

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
    "content-type",
    "content-length",
    "authorization",
    "location",
    "date",
    "cache-control",
  ]);

  return important.has(headerKey);
}

export async function formatResponse(
  request: Request,
  responseData: ResponseData,
) {
  const { response, duration } = responseData;

  // Print request and status lines.
  const statusColor = getStatusColor(response.status);
  const statusLine = `> ${
    colors.cyan(colors.bold(request.method))
  } ${request.url}`;
  const statusInfo = `${
    statusColor(response.status.toString())
  } ${response.statusText}`;
  const durationLine = colors.dim(`${duration.toFixed(2)} (ms)`);

  console.log(statusLine);
  console.log("");

  console.log(statusInfo);
  console.log(durationLine);
  console.log("");

  // Print headers.
  console.log(colors.cyan(colors.bold("Headers")));
  for (const [key, value] of response.headers.entries()) {
    // TODO: print all/most when verbose flag is on.
    if (isImportantHeader(key)) {
      console.log(`   ${colors.dim(key)}: ${value}`);
    }
  }
  console.log("");

  // Print the JSON body.
  const body = await response.json();
  const prettyJson = JSON.stringify(body, null, 2);
  console.log(colors.bold(colors.cyan("Response body")));
  console.log(prettyJson);
}
