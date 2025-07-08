import { loadConfig } from "../config/loader.ts";
import { ParsedCommands } from "../utils/types.ts";
import { resolveRequestDetails } from "../http/request_builder.ts";
import { executeRequest } from "../http/client.ts";
import { handleResponse } from "../http/response_handler.ts";

export async function handleConfigMode(commands: ParsedCommands) {
  const config = await loadConfig();

  if (config) {
    const request = resolveRequestDetails(config, commands);
    const response = await executeRequest(request);

    return await handleResponse(request, response);
  }

  return null;
}
