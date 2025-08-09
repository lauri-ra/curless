import { parse } from 'jsr:@std/yaml';
import { Config } from '../utils/types.ts';
import { join, dirname, resolve } from 'jsr:@std/path';
import { exists } from 'jsr:@std/fs';

/**
 * Traverses the directory from the given path upwards looking for a config file.
 * @param startDir diretory where the search starts
 * @param filename file to look for. 'curless.yaml' by default.
 * @returns Found yaml file or null.
 */
async function findAndReadFile(
  startDir: string,
  filename: string,
): Promise<string | null> {
  // Resolve the starting point into a path
  let currentDir = resolve(startDir);

  while (true) {
    // Append given filename to the path.
    const configPath = join(currentDir, filename);

    // Check if the config file exits in the current location.
    if (await exists(configPath, { isFile: true })) {
      return Deno.readTextFile(configPath);
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
export async function loadConfig(configPath?: string): Promise<Config | null> {
  try {
    let yamlString: string | null;

    if (configPath) {
      // First priority is to load the config from user provided path
      yamlString = await Deno.readTextFile(configPath);
    } else {
      // Attempt to search for the config updwards from current directory.
      yamlString = await findAndReadFile(Deno.cwd(), 'curless.yaml');
    }

    if (!yamlString) {
      console.log('Config file not found. Please provide a path using');
      return null;
    }

    const parsedConfig = parse(yamlString) as Config;
    return parsedConfig;
  } catch (error) {
    console.log(error);
    return null;
  }
}
