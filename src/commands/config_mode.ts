import { loadConfig } from '../config/loader.ts';
import { ParsedCommands } from '../utils/types.ts';
import { Config } from '../utils/types.ts';
import { resolveRequestDetails } from '../http/request_builder.ts';

export async function handleConfigMode(commands: ParsedCommands) {
  console.log('ran config mode with', commands);

  // Load config.
  const config = await loadConfig();

  if (config) {
    // Load correct parts from the config with the user given params.
    const config = await loadConfig();

    const request = resolveRequestDetails(config as Config, commands);

    const response = await fetch(request);
    const data = await response.json();
    console.log(data);
    return data;
  }

  return null;
}
