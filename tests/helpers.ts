import { Config, ParsedCommands } from '../src/utils/types.ts';

export function createMockCommands(
  overrides: Partial<ParsedCommands> = {},
): ParsedCommands {
  return {
    _: [],
    H: [],
    header: [],
    version: false,
    help: false,
    interactive: false,
    verbose: false,
    ...overrides,
  };
}

export function createMockConfig(overrides: Partial<Config> = {}): Config {
  return {
    environments: {
      dev: {
        baseUrl: 'https://api.example.com',
        default: true,
      },
    },
    requests: {
      getUsers: {
        method: 'GET',
        path: '/users',
      },
    },
    data_templates: {},
    ...overrides,
  };
}
