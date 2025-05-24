export interface ParsedCommand {
  type: 'alias' | 'raw';
  command?: string; // For aliases like 'createUser'
  method?: string; // For raw HTTP like 'POST'
  url?: string; // For raw HTTP
  auth?: string;
  data?: string;
  env?: string;
  headers: Record<string, string>;
  verbose: boolean;
  interactive: boolean;
  help: boolean;
}
