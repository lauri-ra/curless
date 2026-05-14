import { dirname, resolve } from "@std/path";
import { load } from "@std/dotenv";
import { Config } from "../utils/types.ts";
import { CurlessError } from "../utils/errors.ts";

let secrets: Record<string, string> = {};

/**
 * Loads the secrets from the provided config path and sets them to the secrets variable.
 * @param config Config file where the env file path is read from.
 * @param configPath Path where the curless.yaml config lives (root of the project).
 */
export async function loadSecrets(
  config: Config,
  configPath: string,
): Promise<void> {
  secrets = {};

  if (config.secrets?.envFile) {
    const envFilePath = resolve(dirname(configPath), config.secrets.envFile);

    try {
      secrets = await load({
        envPath: envFilePath,
        export: true,
      });
    } catch (error) {
      if (error instanceof Deno.errors.NotFound) {
        throw new CurlessError(
          "SECRETS_FILE_MISSING",
          "config",
          `Secrets file '${envFilePath}' was not found.`,
          { cause: error, details: { envFilePath } },
        );
      }

      throw new CurlessError(
        "SECRETS_FILE_UNREADABLE",
        "config",
        `Secrets file '${envFilePath}' could not be loaded.`,
        { cause: error, details: { envFilePath } },
      );
    }
  }
}

export function getSecret(key: string): string | undefined {
  return secrets[key];
}
