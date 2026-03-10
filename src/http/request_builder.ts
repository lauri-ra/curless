import { getSecret } from '../config/secrets.ts';
import {
  Config,
  EnvDetails,
  ParsedCommands,
  RequestDefinition,
} from '../utils/types.ts';

/**
 * Parses the request name and path parameters from positional arguments.
 * e.g., "getUser:123" -> { requestName: "getUser", pathParams: ["123"] }
 */
function parseRequestNameAndParams(positionalArgs: string[]) {
  const requestNameInput = positionalArgs[0];

  if (!requestNameInput) {
    throw new Error('Request name not provided in command.');
  }

  if (requestNameInput.includes(':')) {
    const [requestName, ...pathParams] = requestNameInput.split(':');
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
  // The env flag is provided, try to return matching env from the config.
  if (env) {
    const envDetails = config.environments?.[env];
    if (!envDetails) {
      throw new Error(`Environment '${env}' not found in configuration.`);
    }
    return envDetails;
  }

  if (!config.environments || Object.keys(config.environments).length === 0) {
    throw new Error('No envrionments specified in curless.yaml');
  }
  // No flag provided, so we try to find a default environment.
  const defaultEntry = Object.entries(config.environments).find(
    ([_name, details]) => details.default === true,
  );
  if (defaultEntry) return defaultEntry[1];

  // If we got here, it means there is no valid environment in the config.
  throw new Error('Environment not specified. Use the --env flag.');
}

/**
 * Looks up a named data template from config and returns it as a string.
 */
function getDataTemplate(config: Config, templateName: string): string {
  const dataTemplate = config.data_templates?.[templateName];
  if (!dataTemplate) {
    throw new Error(
      `Data template '${templateName}' not found in configuration.`,
    );
  }

  if (typeof dataTemplate === 'object' && dataTemplate !== null) {
    return JSON.stringify(dataTemplate);
  }

  return dataTemplate as string;
}

/**
 * Resolves the request body with the following priority:
 * 1. CLI --data as raw JSON (starts with { or [)
 * 2. CLI --data as template name lookup
 * 3. Request definition's data_template field
 * 4. Request definition's inline data field
 */
function resolveBody(
  config: Config,
  commands: ParsedCommands,
  requestDefinition: RequestDefinition,
): string | null {
  const cliData = commands.data as string | undefined;

  if (cliData) {
    const trimmed = cliData.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      return trimmed;
    }
    return getDataTemplate(config, cliData);
  }

  if (requestDefinition.data_template) {
    return getDataTemplate(config, requestDefinition.data_template);
  }

  if (requestDefinition.data !== undefined) {
    if (typeof requestDefinition.data === 'object' && requestDefinition.data !== null) {
      return JSON.stringify(requestDefinition.data);
    }
    return String(requestDefinition.data);
  }

  return null;
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
      `Path '${configuredPath}' requires ${
        placeholders.length
      } parameter(s), but ${
        pathParams.length
      } were given. (Request: ${requestName}, Params: [${pathParams.join(
        ', ',
      )}])`,
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
    '_',
    'env',
    'e',
    'data',
    'd',
    'version',
    'V',
    'help',
    'h',
    'header',
    'H',
    'interactive',
    'i',
    'config',
    'c',
    'force',
    'f',
    'verbose',
    'v',
    // Exclude deno specific flags.
    'output',
    'allow-read',
    'allow-net',
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

  const baseUrl = envDetails.baseUrl.endsWith('/')
    ? envDetails.baseUrl.slice(0, -1)
    : envDetails.baseUrl;

  const finalPath = buildPath(requestDefinition.path, pathParams, requestName);
  const pathSegment = finalPath.startsWith('/')
    ? finalPath.slice(1)
    : finalPath;

  const queryString = buildQueryString(commands);

  return queryString
    ? `${baseUrl}/${pathSegment}?${queryString}`
    : `${baseUrl}/${pathSegment}`;
}

/**
 * Goes through request headers and replaces secret
 * placeholders with the actual values from the env file.
 * @param headers
 * @returns replaced headers
 */
function replaceHeaderSecrets(
  headers: HeadersInit | undefined,
): HeadersInit | undefined {
  if (!headers) return undefined;

  const processedHeaders: Record<string, string> = {};
  const secretRegex = /\${([^{}]+)\}/g; // this matches ${SECRET_NAME}

  for (const [key, value] of Object.entries(headers)) {
    let processedValue = value;
    let match;

    while ((match = secretRegex.exec(value)) !== null) {
      const secretName = match[1];
      const secretValue = getSecret(secretName);
      if (secretValue) {
        processedValue = value.replace(match[0], secretValue);
      } else {
        throw new Error(`Secret ${match[0]} not found`);
      }
    }
    processedHeaders[key] = processedValue;
  }

  return processedHeaders;
}

/**
 * Resolves all details of a request from the configuration and command-line arguments.
 * @param config
 * @param commands
 * @returns Request
 */
export function resolveRequestDetails(
  config: Config,
  commands: ParsedCommands,
): Request {
  const { requestName, pathParams } = parseRequestNameAndParams(commands._);

  const requestDefinition = getRequestDefinition(config, requestName);
  const envDetails = getEnvironmentDetails(config, commands.env as string);
  const body = resolveBody(config, commands, requestDefinition);
  const headers = replaceHeaderSecrets(requestDefinition.headers);

  const fullUrl = constructUrl(
    envDetails,
    requestDefinition,
    pathParams,
    commands,
    requestName,
  );

  const request = new Request(fullUrl, {
    method: requestDefinition.method.toUpperCase(),
    headers,
    body,
  });

  return request;
}
