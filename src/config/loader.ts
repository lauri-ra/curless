import { Config } from "./types.ts";
import { parse } from "jsr:@std/yaml";
import { dirname, fromFileUrl, join } from "jsr:@std/path";
import { ParsedCommands } from "../types.ts";

// Loads and parses config.yaml.
export async function loadConfig(configPath?: string): Promise<Config | null> {
  const defaultPath = join(
    dirname(fromFileUrl(import.meta.url)),
    "../../config.yaml",
  );
  const pathToLoad = configPath || defaultPath;

  try {
    const fileContent = await Deno.readFile(pathToLoad);
    const decoder = new TextDecoder("utf-8");
    const yamlString = decoder.decode(fileContent);
    const parsedConfig = parse(yamlString) as Config;

    return parsedConfig;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export function resolveRequestDetails(
  config: Config,
  commands: ParsedCommands,
): Request {
  const positionalArgs = commands._;
  const requestNameInput = positionalArgs[0];

  if (!requestNameInput) {
    throw new Error("Request name not provided in command.");
  }

  let requestName = requestNameInput;
  let pathParams: string[] = [];
  if (requestNameInput.includes(":")) {
    const parts = requestName.split(":", 2);
    requestName = parts[0];
    pathParams = parts.slice(1);
  }

  const requestDefinition = config.requests?.[requestName];
  if (!requestDefinition) {
    throw new Error(`Request '${requestName}' not found in configuration.`);
  }

  if (!commands.env) {
    throw new Error("Environment not specified. Use the --env flag.");
  }
  const envDetails = config.environments?.[commands.env];
  if (!envDetails) {
    throw new Error(
      `Environment '${commands.env}' not found in configuration.`,
    );
  }

  let bodyContent: BodyInit | undefined | null = null;
  if (commands.data) {
    const dataTemplate = config.data_templates?.[commands.data];
    if (!dataTemplate) {
      throw new Error(
        `Data template '${commands.data}' not found in configuration.`,
      );
    }
    // Assuming dataTemplate is an object that needs to be stringified for JSON
    // Adjust if your data_templates are already strings or need different handling
    if (typeof dataTemplate === "object" && dataTemplate !== null) {
      bodyContent = JSON.stringify(dataTemplate);
    } else if (typeof dataTemplate === "string") {
      bodyContent = dataTemplate;
    }
  }

  // Construct the full URL
  // Ensure no double slashes if baseUrl ends with / and path starts with /
  if (!envDetails.baseUrl) {
    throw new Error(`Base URL not defined for environment '${commands.env}'.`);
  }
  const baseUrl = envDetails.baseUrl.endsWith("/")
    ? envDetails.baseUrl.slice(0, -1)
    : envDetails.baseUrl;

  // TODO: separate function.
  const configuredPath = requestDefinition.path;
  const placeholderRegex = /\{([^{}]+)\}/g;

  let match: RegExpExecArray | null;
  let processedPath = "";
  let lastIndex = 0;
  let paramIndex = 0;

  while ((match = placeholderRegex.exec(configuredPath)) !== null) {
    // Check if there are placeholders to fill, but the user has not provided all of them.
    if (paramIndex >= pathParams.length) {
      throw new Error(
        `Not enough path parameters provided for path: '${configuredPath}'. Expected parameter for '${
          match[1]
        }', but only ${pathParams.length} parameter(s) were given. (Request: ${requestName}, Params: [${
          pathParams.join(", ")
        }])`,
      );
    }

    processedPath += configuredPath.substring(lastIndex, match.index); // Append part before placeholder
    processedPath += pathParams[paramIndex]; // Append path parameter value
    lastIndex = placeholderRegex.lastIndex; // Update lastIndex to end of current match
    paramIndex++;
  }
  // Include the rest of the path (if there is any).
  processedPath += configuredPath.substring(lastIndex);

  // Check that there are no unused params that were provided by the user.
  // ParamIndex reflects how many were used.
  if (paramIndex < pathParams.length) {
    throw new Error(
      `Too many path parameters provided. Path '${configuredPath}' requires ${paramIndex} parameter(s), but ${pathParams.length} were given. (Request: ${requestName}, Params: [${
        pathParams.join(", ")
      }])`,
    );
  }

  const finalPath = processedPath.startsWith("/")
    ? processedPath.slice(1)
    : processedPath;

  const fullUrl = `${baseUrl}/${finalPath}`;

  const request = new Request(fullUrl, {
    method: requestDefinition.method.toUpperCase(),
    headers: requestDefinition.headers,
    body: bodyContent,
  });

  return request;
}
