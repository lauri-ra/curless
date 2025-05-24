import { showHelp } from './commands/utils.ts';
import { parseCliArgs } from './utils/parser.ts';

function main() {
  const commands = parseCliArgs(Deno.args);

  if (commands.help) {
    showHelp();
    Deno.exit(0);
  }

  if (commands.version) {
    console.log('Curless version 0.1');
    Deno.exit();
  }

  const httpMethods = new Set(['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS']);
  const positionalArgs = commands._;

  const firstArg = String(positionalArgs[0]).toUpperCase();

  try {
    if (httpMethods.has(firstArg)) {
      console.log('Run manual request', { firstArg, commands });
      // await handleManualMode()
    } else {
      console.log('Config mode', { firstArg: positionalArgs[0], commands });
      // await handleConfigMode();
    }
  } catch (error) {
    console.log('Error', error);
    Deno.exit(1);
  }
}

main();
