import { run } from './src/CLI.ts';
import { printMessage } from './src/output/response_formatter.ts';

async function main() {
  try {
    await run();
  } catch (error) {
    printMessage('error', `Encountered fatal error: ${String(error)}`);
    Deno.exit(1);
  }
}

main();
