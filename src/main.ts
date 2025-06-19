import { run } from './CLI.ts';

async function main() {
  try {
    await run();
  } catch (error) {
    console.log('Encountered fatal error', error);
    Deno.exit(1);
  }
}

main();
