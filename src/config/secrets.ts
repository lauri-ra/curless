import { dirname, resolve } from 'jsr:@std/path';
import { load } from 'jsr:@std/dotenv';
import { Config } from '../utils/types.ts';
import { printMessage } from '../output/response_formatter.ts';

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
  if (config.secrets?.envFile) {
    const envFilePath = resolve(dirname(configPath), config.secrets.envFile);

    try {
      secrets = await load({
        envPath: envFilePath,
        export: true,
      });
    } catch (error) {
      printMessage(
        'error',
        `Error loading secrets from ${envFilePath}. ` + error,
      );
    }
  }
}

export function getSecret(key: string): string | undefined {
  return secrets[key];
}
