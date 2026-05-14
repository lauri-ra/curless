import { CurlessError } from "./errors.ts";

function utf8ToBase64(value: string): string {
  return btoa(String.fromCharCode(...new TextEncoder().encode(value)));
}

/**
 * Parses a --auth spec into an Authorization header.
 *
 * Supported schemes:
 *   --auth basic:USER:PASSWORD   → Basic base64(USER:PASSWORD)
 *   --auth bearer:TOKEN          → Bearer TOKEN
 *
 * The colon after the scheme delimits the scheme from the credential; any
 * further colons are preserved as part of the credential (passwords may
 * contain ':').
 */
export function buildAuthHeader(authSpec: string): [string, string] {
  const schemeEnd = authSpec.indexOf(":");
  const scheme = schemeEnd === -1 ? authSpec : authSpec.slice(0, schemeEnd);
  const credential = schemeEnd === -1 ? "" : authSpec.slice(schemeEnd + 1);

  switch (scheme.toLowerCase()) {
    case "basic": {
      if (!credential.includes(":")) {
        throw new CurlessError(
          "AUTH_INVALID",
          "user",
          `Invalid --auth value '${authSpec}'. Use --auth basic:USER:PASSWORD.`,
          { details: { authSpec } },
        );
      }
      return ["Authorization", `Basic ${utf8ToBase64(credential)}`];
    }
    case "bearer": {
      if (!credential) {
        throw new CurlessError(
          "AUTH_INVALID",
          "user",
          `Invalid --auth value '${authSpec}'. Use --auth bearer:TOKEN.`,
          { details: { authSpec } },
        );
      }
      return ["Authorization", `Bearer ${credential}`];
    }
    default:
      throw new CurlessError(
        "AUTH_UNSUPPORTED",
        "user",
        `Unsupported --auth scheme '${scheme}'. Supported schemes: basic, bearer.`,
        { details: { scheme } },
      );
  }
}
