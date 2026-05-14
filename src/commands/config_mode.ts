import { loadConfig } from "../config/loader.ts";
import { ParsedCommands } from "../utils/types.ts";
import { resolveRequestDetails } from "../http/request_builder.ts";
import { executeRequest } from "../http/client.ts";
import { handleResponse } from "../http/response_handler.ts";
import { parseTimeoutSeconds } from "../utils/timeout.ts";

/**
 * Handles loading the config file, parsing and exectuing the request
 * with user given commands and logging it out.
 * @param commands
 */
export async function handleConfigMode(commands: ParsedCommands) {
  const config = await loadConfig(commands?.config);
  const request = resolveRequestDetails(config, commands);
  const timeoutSeconds = parseTimeoutSeconds(commands.timeout);
  const response = await executeRequest(request, { timeoutSeconds });

  return await handleResponse(request, response, commands.verbose);
}
