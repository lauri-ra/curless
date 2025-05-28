export interface ParsedCommands {
  _: (string | number)[];
  H: string[];
  header: string[];
  version: boolean;
  help: boolean;
  interactive: boolean;
  auth?: string;
  data?: string;
  env?: string;
  [key: string]: unknown;
}
