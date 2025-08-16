import { loadConfig } from '../config/loader.ts';
import { ParsedCommands } from '../utils/types.ts';
import { resolveRequestDetails } from '../http/request_builder.ts';
import { executeRequest } from '../http/client.ts';
import { handleResponse } from '../http/response_handler.ts';

/**
 * Handles loading the config file, parsing and exectuing the request
 * with user given commands and logging it out.
 * @param commands
 */
export async function handleConfigMode(commands: ParsedCommands) {
  const config = await loadConfig(commands?.config);

  if (config) {
    const request = resolveRequestDetails(config, commands);
    const response = await executeRequest(request);

    return await handleResponse(request, response, commands.verbose);
  }

  return null;
}
