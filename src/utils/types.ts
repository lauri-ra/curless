export interface ParsedCommands {
  _: string[];
  H: string[];
  header: string[];
  version: boolean;
  help: boolean;
  interactive: boolean;
  verbose: boolean;
  auth?: string;
  data?: string;
  env?: string;
  config?: string;
  migrate?: string;
  [key: string]: unknown;
}

export interface Config {
  environments?: {
    [key: string]: {
      baseUrl?: string;
      apiKey?: string;
      default?: boolean;
      [key: string]: unknown;
    };
  };
  secrets?: {
    envFile?: string;
  };
  requests?: {
    [key: string]: {
      method: string;
      path: string;
      headers?: { [key: string]: string };
      data_template?: string;
      data?: unknown;
    };
  };
  data_templates?: {
    [key: string]: unknown;
  };
}

export interface ResponseData {
  response: Response;
  duration: number;
}

export interface FormatOptions {
  showHeaders?: boolean;
  showBody?: boolean;
  verbose?: boolean;
}

export type EnvDetails = NonNullable<Config['environments']>[string];

export type RequestDefinition = NonNullable<Config['requests']>[string];
