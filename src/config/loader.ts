import { parse } from "@std/yaml";
import { Config } from "../utils/types.ts";
import { dirname, join, resolve } from "@std/path";
import { exists } from "@std/fs";
import { loadSecrets } from "./secrets.ts";
import { CurlessError } from "../utils/errors.ts";

/**
 * Traverses the directory from the given path upwards looking for a config file.
 * @param startDir diretory where the search starts
 * @param filename file to look for. 'curless.yaml' by default.
 * @returns Found yaml file or null.
 */
async function findAndReadFile(
  startDir: string,
  filename: string,
): Promise<{ content: string; path: string } | null> {
  // Resolve the starting point into a path
  let currentDir = resolve(startDir);

  while (true) {
    // Append given filename to the path.
    const configPath = join(currentDir, filename);

    // Check if the config file exits in the current location.
    if (await exists(configPath, { isFile: true })) {
      let content: string;
      try {
        content = await Deno.readTextFile(configPath);
      } catch (error) {
        throw new CurlessError(
          "CONFIG_UNREADABLE",
          "config",
          `Config file '${configPath}' could not be read.`,
          { cause: error, details: { configPath } },
        );
      }

      return { content, path: configPath };
    }

    // Get the parent dir of current path.
    const parentDir = dirname(currentDir);

    // If current dir is also the parent, we have reached the root.
    if (parentDir === currentDir) {
      return null;
    }

    // Move onto checking the parent direcotry.
    currentDir = parentDir;
  }
}

// Loads and parses config.yaml.
export async function loadConfig(configPath?: string): Promise<Config> {
  let yamlString: string | null;
  let foundConfigPath: string | undefined;

  if (configPath) {
    // First priority is to load the config from user provided path
    try {
      yamlString = await Deno.readTextFile(configPath);
      foundConfigPath = configPath;
    } catch (error) {
      if (error instanceof Deno.errors.NotFound) {
        throw new CurlessError(
          "CONFIG_NOT_FOUND",
          "config",
          `Config file '${configPath}' was not found.`,
          { cause: error, details: { configPath } },
        );
      }

      throw new CurlessError(
        "CONFIG_UNREADABLE",
        "config",
        `Config file '${configPath}' could not be read.`,
        { cause: error, details: { configPath } },
      );
    }
  } else {
    // Attempt to search for the config upwards from current directory.
    const result = await findAndReadFile(Deno.cwd(), "curless.yaml");

    if (result) {
      yamlString = result.content;
      foundConfigPath = result.path;
    } else {
      yamlString = null;
    }
  }

  if (!yamlString || !foundConfigPath) {
    throw new CurlessError(
      "CONFIG_NOT_FOUND",
      "config",
      "Config file was not found.",
    );
  }

  let parsedConfig: Config;
  try {
    parsedConfig = parse(yamlString) as Config;
  } catch (error) {
    throw new CurlessError(
      "CONFIG_INVALID_YAML",
      "config",
      `Failed to parse YAML in '${foundConfigPath}'.`,
      { cause: error, details: { configPath: foundConfigPath } },
    );
  }

  await loadSecrets(parsedConfig, foundConfigPath);

  return parsedConfig;
}
