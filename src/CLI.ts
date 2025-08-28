import { parseCliArgs } from './utils/parser.ts';
import { showHelp } from './commands/help_command.ts';
import { handleManualMode } from './commands/manual_mode.ts';
import { handleConfigMode } from './commands/config_mode.ts';
import { initCurless } from './commands/init_command.ts';
import { printMessage } from './output/response_formatter.ts';
import { migratePostman } from './commands/migrate_commands.ts';

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

  if (commands.migrate) {
    await migratePostman(commands.migrate);
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
    Deno.exit();
  }

  if (String(positionalArgs[0]).toLowerCase() === 'init') {
    await initCurless(Boolean(commands.force) || false);
    Deno.exit();
  }

  const firstArg = String(positionalArgs[0]).toUpperCase();

  try {
    if (httpMethods.has(firstArg)) {
      await handleManualMode(commands);
    } else {
      await handleConfigMode(commands);
    }
  } catch (error) {
    printMessage('error', String(error));
    Deno.exit(1);
  }
}
