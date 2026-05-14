export type CurlessErrorCategory = "user" | "config" | "network" | "internal";

export type CurlessErrorCode =
  | "CONFIG_NOT_FOUND"
  | "CONFIG_UNREADABLE"
  | "CONFIG_INVALID_YAML"
  | "SECRETS_FILE_MISSING"
  | "SECRETS_FILE_UNREADABLE"
  | "SECRET_NOT_FOUND"
  | "REQUEST_NAME_MISSING"
  | "REQUEST_NOT_FOUND"
  | "ENVIRONMENTS_MISSING"
  | "ENV_NOT_FOUND"
  | "ENV_NOT_SPECIFIED"
  | "BASE_URL_MISSING"
  | "DATA_TEMPLATE_NOT_FOUND"
  | "PATH_PARAM_MISMATCH"
  | "INVALID_HEADER"
  | "MANUAL_URL_MISSING"
  | "MANUAL_URL_INVALID"
  | "AUTH_INVALID"
  | "AUTH_UNSUPPORTED"
  | "NETWORK_FAILURE";

export interface CurlessErrorOptions {
  cause?: unknown;
  details?: Record<string, unknown>;
}

export class CurlessError extends Error {
  code: CurlessErrorCode;
  category: CurlessErrorCategory;
  details?: Record<string, unknown>;

  constructor(
    code: CurlessErrorCode,
    category: CurlessErrorCategory,
    message: string,
    options: CurlessErrorOptions = {},
  ) {
    super(message);
    this.name = "CurlessError";
    this.code = code;
    this.category = category;
    this.details = options.details;

    if (options.cause !== undefined) {
      this.cause = options.cause;
    }
  }
}

export function isCurlessError(error: unknown): error is CurlessError {
  return error instanceof CurlessError;
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}
