import { CurlessError } from "./errors.ts";

/**
 * Parses --timeout into seconds. Returns undefined when no value was passed,
 * leaving the default to executeRequest. Throws TIMEOUT_INVALID for values
 * that are not a positive finite number.
 */
export function parseTimeoutSeconds(
  raw: string | undefined,
): number | undefined {
  if (raw === undefined) return undefined;

  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new CurlessError(
      "TIMEOUT_INVALID",
      "user",
      `Invalid --timeout value '${raw}'. Provide a positive number of seconds.`,
      { details: { raw } },
    );
  }

  return parsed;
}
