export interface Config {
  environments?: {
    [key: string]: {
      baseUrl?: string;
      apiKey?: string;
      [key: string]: unknown; // Allow other environment-specific settings
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
      data?: unknown; // For inline data
    };
  };
  data_templates?: {
    [key: string]: unknown;
  };
}
