import {
  CurlessError,
  getErrorMessage,
  isCurlessError,
} from "../utils/errors.ts";

function getDetail(error: CurlessError, key: string): string | undefined {
  const value = error.details?.[key];
  return typeof value === "string" ? value : undefined;
}

export function formatError(error: unknown): string {
  if (isCurlessError(error)) {
    switch (error.code) {
      case "CONFIG_NOT_FOUND": {
        const configPath = getDetail(error, "configPath");
        if (configPath) {
          return `Config file not found at '${configPath}'. Check the path passed to --config.`;
        }

        return "Config file not found. Provide --config <path> or run `curless init`.";
      }
      case "CONFIG_UNREADABLE":
        return `Could not read config file '${
          getDetail(error, "configPath")
        }'. ${error.message}`;
      case "CONFIG_INVALID_YAML":
        return `Config file '${
          getDetail(error, "configPath")
        }' contains invalid YAML. ${error.message}`;
      case "SECRETS_FILE_MISSING":
        return `Secrets file not found at '${
          getDetail(error, "envFilePath")
        }'.`;
      case "SECRETS_FILE_UNREADABLE":
        return `Could not read secrets file '${
          getDetail(error, "envFilePath")
        }'. ${error.message}`;
      case "SECRET_NOT_FOUND":
        return error.message;
      case "REQUEST_NAME_MISSING":
      case "REQUEST_NOT_FOUND":
      case "ENVIRONMENTS_MISSING":
      case "ENV_NOT_FOUND":
      case "ENV_NOT_SPECIFIED":
      case "BASE_URL_MISSING":
      case "DATA_TEMPLATE_NOT_FOUND":
      case "PATH_PARAM_MISMATCH":
      case "INVALID_HEADER":
      case "MANUAL_URL_MISSING":
      case "MANUAL_URL_INVALID":
        return error.message;
      case "NETWORK_FAILURE":
        return `Request failed: ${error.message}`;
    }
  }

  return `Unexpected error: ${getErrorMessage(error)}`;
}
