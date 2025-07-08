import {
  Config,
  EnvDetails,
  ParsedCommands,
  RequestDefinition,
} from "../utils/types.ts";

/**
 * Parses the request name and path parameters from positional arguments.
 * e.g., "getUser:123" -> { requestName: "getUser", pathParams: ["123"] }
 */
function parseRequestNameAndParams(positionalArgs: string[]) {
  const requestNameInput = positionalArgs[0];

  if (!requestNameInput) {
    throw new Error("Request name not provided in command.");
  }

  if (requestNameInput.includes(":")) {
    const [requestName, ...pathParams] = requestNameInput.split(":");
    return { requestName, pathParams };
  }

  return { requestName: requestNameInput, pathParams: [] };
}

/**
 * Retrieves the request definition from the configuration.
 */
function getRequestDefinition(config: Config, requestName: string) {
  const requestDefinition = config.requests?.[requestName];

  if (!requestDefinition) {
    throw new Error(`Request '${requestName}' not found in configuration.`);
  }
  return requestDefinition;
}

/**
 * Retrieves the environment details from the configuration.
 */
function getEnvironmentDetails(config: Config, env: string) {
  if (!env) {
    throw new Error("Environment not specified. Use the --env flag.");
  }
  const envDetails = config.environments?.[env];
  if (!envDetails) {
    throw new Error(`Environment '${env}' not found in configuration.`);
  }
  return envDetails;
}

/**
 * Resolves the request body from a data template if one is provided.
 */
function getRequestBody(config: Config, templateName: string) {
  if (!templateName) {
    return null;
  }

  const dataTemplate = config.data_templates?.[templateName];
  if (!dataTemplate) {
    throw new Error(
      `Data template '${templateName}' not found in configuration.`,
    );
  }

  if (typeof dataTemplate === "object" && dataTemplate !== null) {
    return JSON.stringify(dataTemplate);
  }

  return dataTemplate as string;
}

/**
 * Builds the request path by replacing placeholders with provided parameters.
 */
function buildPath(
  configuredPath: string,
  pathParams: string[],
  requestName: string,
) {
  // Regex finds all the config placeholders within curcy braces.
  // eg. /api/some/{id}/path/{userId} -> id, userId
  const placeholderRegex = /\{([^{}]+)\}/g;
  const placeholders = configuredPath.match(placeholderRegex) || [];

  // If the provided params length does not match
  // with placeholders from config, something is wrong and we log an error.
  if (placeholders.length !== pathParams.length) {
    throw new Error(
      `Path '${configuredPath}' requires ${placeholders.length} parameter(s), but ${pathParams.length} were given. (Request: ${requestName}, Params: [${
        pathParams.join(
          ", ",
        )
      }])`,
    );
  }

  // Iterate over the found placeholders and replace each
  // with corresponding value from the provided path params.
  let processedPath = configuredPath;
  placeholders.forEach((placeholder, index) => {
    processedPath = processedPath.replace(placeholder, pathParams[index]);
  });

  return processedPath;
}

/**
 * Builds a query string from the command arguments, excluding known flags.
 */
function buildQueryString(commands: ParsedCommands): string {
  const queryParams = new URLSearchParams();
  // TODO: place these in some shared location.
  const knownCommandKeys = new Set([
    "_",
    "env",
    "e",
    "data",
    "d",
    "version",
    "v",
    "help",
    "h",
    "header",
    "H",
    "interactive",
    "i",
    // Exclude deno specific flags.
    "output",
    "allow-read",
    "allow-net",
  ]);

  // Append the query params that are not in the exlcusion list keys
  for (const key in commands) {
    if (!knownCommandKeys.has(key)) {
      const value = commands[key];
      queryParams.append(key, String(value));
    }
  }
  return queryParams.toString();
}

/**
 * Constructs the full URL for the request.
 */
function constructUrl(
  envDetails: EnvDetails,
  requestDefinition: RequestDefinition,
  pathParams: string[],
  commands: ParsedCommands,
  requestName: string,
): string {
  if (!envDetails.baseUrl) {
    throw new Error(`Base URL not defined for environment '${commands.env}'.`);
  }

  const baseUrl = envDetails.baseUrl.endsWith("/")
    ? envDetails.baseUrl.slice(0, -1)
    : envDetails.baseUrl;

  const finalPath = buildPath(requestDefinition.path, pathParams, requestName);
  const pathSegment = finalPath.startsWith("/")
    ? finalPath.slice(1)
    : finalPath;

  const queryString = buildQueryString(commands);

  return queryString
    ? `${baseUrl}/${pathSegment}?${queryString}`
    : `${baseUrl}/${pathSegment}`;
}

/**
 * Resolves all details of a request from the configuration and command-line arguments.
 */
export function resolveRequestDetails(
  config: Config,
  commands: ParsedCommands,
): Request {
  // TODO: update typings.
  const { requestName, pathParams } = parseRequestNameAndParams(commands._);

  const requestDefinition = getRequestDefinition(config, requestName);
  const envDetails = getEnvironmentDetails(config, commands.env as string);
  const bodyContent = getRequestBody(config, commands.data as string);

  const fullUrl = constructUrl(
    envDetails,
    requestDefinition,
    pathParams,
    commands,
    requestName,
  );

  const request = new Request(fullUrl, {
    method: requestDefinition.method.toUpperCase(),
    headers: requestDefinition.headers,
    body: bodyContent,
  });

  return request;
}
