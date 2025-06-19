import { parse } from 'jsr:@std/yaml';
import { Config } from '../utils/types.ts';

// Loads and parses config.yaml.
export async function loadConfig(configPath?: string): Promise<Config | null> {
  const defaultPath = configPath || 'config.yaml';

  try {
    const fileContent = await Deno.readFile(defaultPath);
    const decoder = new TextDecoder('utf-8');
    const yamlString = decoder.decode(fileContent);
    const parsedConfig = parse(yamlString) as Config;

    return parsedConfig;
  } catch (error) {
    console.log(error);
    return null;
  }
}
