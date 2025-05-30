// Handles making the HTTP requests
import { loadConfig, resolveRequestDetails } from '../config/loader.ts';
import { ParsedCommands } from '../types.ts';
import { Config } from '../config/types.ts';

export async function handleManualMode(commands: ParsedCommands) {
  console.log('called manual mode with', commands);
  // Extract method and URL
  const positionalArgs = commands._;
  const method = String(positionalArgs[0]).toUpperCase();
  const url = String(positionalArgs[1]);

  // Extract headers
  const requestHeaders = new Headers();
  for (const h of commands.header) {
    const [key, value] = h.split(':');

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

export async function handleConfigMode(commands: ParsedCommands) {
  console.log('ran config mode with', commands);

  // Load config.
  const config = await loadConfig();

  if (config) {
    // Load correct parts from the config with the user given params.
    const config = await loadConfig();

    const request = resolveRequestDetails(config as Config, commands);

    const response = await fetch(request);
    const data = await response.json();
    console.log(data);
    return data;
  }

  return null;
}
