import { run } from "./src/CLI.ts";
import { formatError } from "./src/output/error_formatter.ts";
import { printMessage } from "./src/output/response_formatter.ts";

async function main() {
  try {
    await run();
  } catch (error) {
    printMessage("error", formatError(error));
    Deno.exit(1);
  }
}

main();
