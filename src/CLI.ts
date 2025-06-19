import { parseCliArgs } from './utils/parser.ts';
import { showHelp } from './commands/help_command.ts';
import { handleManualMode } from './commands/manual_mode.ts';
import { handleConfigMode } from './commands/config_mode.ts';

export async function run() {
  const commands = parseCliArgs(Deno.args);

  if (commands.help) {
    showHelp();
    Deno.exit(0);
  }

  if (commands.version) {
    console.log('Curless version 0.1');
    Deno.exit();
  }

  const httpMethods = new Set([
    'GET',
    'POST',
    'PUT',
    'DELETE',
    'PATCH',
    'HEAD',
    'OPTIONS',
  ]);

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
