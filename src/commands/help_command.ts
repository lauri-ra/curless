import { VERSION } from "../version.ts";

export function showHelp() {
  const help = `
curless ${VERSION} — a config-driven HTTP client

USAGE:
  curless <requestName>[:param[:param...]] [options]   Run a configured request
  curless <METHOD> <url> [options]                     Send a raw HTTP request
  curless init [-f]                                    Create a starter curless.yaml
  curless list                                         List configured requests

EXAMPLES:
  # Configured request from curless.yaml
  curless createPost --env dev
  curless getPostById:5 --env dev

  # Configured request with auth and a data template
  curless getUser --env prod --auth bearer:\$TOKEN
  curless adminPing --env prod --auth basic:admin:\$PASSWORD

  # Raw HTTP requests
  curless POST https://api.example.com/users \\
    -H "Content-Type: application/json" \\
    -d '{"name":"Alice"}'

  curless GET https://api.example.com/users/123 --verbose

OPTIONS:
  -a, --auth <spec>        Authentication credentials. Supported forms:
                             basic:USER:PASSWORD
                             bearer:TOKEN
                           Explicit -H Authorization wins over --auth.
  -d, --data <value>       Request body. In config mode: a data_templates key
                           or raw JSON ({...} / [...]). In manual mode: raw.
  -e, --env <name>         Environment to use. Defaults to the environment
                           marked default: true in curless.yaml.
  -H, --header <K:V>       Add a request header. Repeatable.
  -c, --config <path>      Use a specific curless.yaml instead of upward-search.
  -f, --force              Overwrite when used with 'curless init'.
  -v, --verbose            Show response headers.
  -h, --help               Show this help message.
  -V, --version            Show version.

EXPERIMENTAL:
      --migrate <file>     Import a Postman v2.1 collection JSON into a
                           curless.postman.yaml file. Partial support — flat
                           collections only; bodies, variables, auth, and
                           folders are not yet handled.
      --baseUrl <url>      Override the base URL when migrating.

CONFIGURATION:
  curless looks for curless.yaml by walking upward from the current directory.
  Pass --config to point at a specific file.

  Run 'curless init' in your project root to create a starter config.
`;

  console.log(help);
}
