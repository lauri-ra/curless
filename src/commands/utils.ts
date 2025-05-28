import { ParsedCommands } from '../types.ts';

export function showHelp() {
  const help = `
🚀 curless - A fast, config-driven HTTP client

USAGE:
  curless <command> [options]          # Use predefined request
  curless <METHOD> <url> [options]     # Raw HTTP request

EXAMPLES:
  # Using config aliases
  curless createUser --auth apikey --data dummy_user --env dev
  curless getUser --auth token --env prod
  
  # Raw HTTP requests  
  curless POST https://api.example.com/users \\
    -H "Authorization: Bearer xyz" \\
    -d '{"name":"Alice"}'
    
  curless GET https://api.example.com/users/123 --verbose

OPTIONS:
  -a, --auth <type>        Authentication method (from config)
  -d, --data <template>    Data template name (from config) or raw JSON
  -e, --env <environment>  Environment to use (default: dev)
  -H, --header <header>    Add header (can be used multiple times)
  -i, --interactive        Edit request in $EDITOR before sending
  -v, --verbose            Show detailed request/response info
  -h, --help              Show this help message
      --version           Show version

CONFIGURATION:
  curless looks for curless.yaml in current directory or ~/.config/curless/
  
  Run 'curless config init' to create an example configuration file.
`;

  console.log(help);
}

export async function handleManualMode(commands: ParsedCommands) {
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

  // Extract function and url
  const positionalArgs = commands._;
  const method = String(positionalArgs[0]).toUpperCase();
  const func = String(positionalArgs[1]);

  // TODO: make sure func is found from the config file!

  return await Promise.resolve();
}
