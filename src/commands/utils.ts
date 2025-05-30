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
