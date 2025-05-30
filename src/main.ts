import { showHelp } from './commands/utils.ts';
import { handleConfigMode, handleManualMode } from './commands/request.ts';
import { parseCliArgs } from './utils/parser.ts';

async function main() {
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

  if (positionalArgs.length === 0) {
    console.error('No command provided. Use --help for usage information.');
  }

  const firstArg = String(positionalArgs[0]).toUpperCase();

  try {
    if (httpMethods.has(firstArg)) {
      await handleManualMode(commands);
    } else {
      await handleConfigMode(commands);
    }
  } catch (error) {
    console.log('Error', error);
    Deno.exit(1);
  }
}

main();
