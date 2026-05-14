import { parseCliArgs } from "./utils/parser.ts";
import { showHelp } from "./commands/help_command.ts";
import { handleManualMode } from "./commands/manual_mode.ts";
import { handleConfigMode } from "./commands/config_mode.ts";
import { initCurless } from "./commands/init_command.ts";
import { migratePostman } from "./commands/migrate_commands.ts";
import { listRequests } from "./commands/list_command.ts";
import { VERSION } from "./version.ts";

export async function run() {
  const commands = parseCliArgs(Deno.args);

  if (commands.help) {
    showHelp();
    Deno.exit(0);
  }

  if (commands.version) {
    console.log(`curless ${VERSION}`);
    Deno.exit();
  }

  if (commands.migrate) {
    await migratePostman(commands);
    Deno.exit();
  }

  const httpMethods = new Set([
    "GET",
    "POST",
    "PUT",
    "DELETE",
    "PATCH",
    "HEAD",
    "OPTIONS",
  ]);

  const positionalArgs = commands._;

  if (positionalArgs.length === 0) {
    console.error("No command provided. Use --help for usage information.");
    Deno.exit();
  }

  if (String(positionalArgs[0]).toLowerCase() === "init") {
    await initCurless(Boolean(commands.force) || false);
    Deno.exit();
  }

  if (String(positionalArgs[0]).toLowerCase() === "list") {
    await listRequests(commands.config);
    Deno.exit();
  }

  const firstArg = String(positionalArgs[0]).toUpperCase();

  if (httpMethods.has(firstArg)) {
    await handleManualMode(commands);
  } else {
    await handleConfigMode(commands);
  }
}
