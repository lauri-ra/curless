// Handles making the HTTP requests
import { ParsedCommands } from "../utils/types.ts";

export async function handleManualMode(commands: ParsedCommands) {
  console.log("called manual mode with", commands);
  // TODO: move to request builder
  // Extract method and URL
  const positionalArgs = commands._;
  const method = String(positionalArgs[0]).toUpperCase();
  const url = String(positionalArgs[1]);

  // Extract headers
  const requestHeaders = new Headers();
  for (const h of commands.header) {
    const [key, value] = h.split(":");

    if (!key || value.length === 0) {
      throw new Error(`Invalid header format! Use "Key:Value`);
    }
    requestHeaders.append(key, value);
  }

  // Create the request and include data.
  const request = new Request(url, {
    method,
    headers: requestHeaders,
    body: commands.data as string,
  });

  // Call HTTP request function
  const response = await fetch(request);
  const data = await response.json();
  console.log(data);

  // TODO: Call the output formatter

  // Return response
  return data;
}
