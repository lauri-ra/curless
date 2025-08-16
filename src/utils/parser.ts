import { parseArgs } from 'jsr:@std/cli/parse-args';
import { ParsedCommands } from './types.ts';

export function parseCliArgs(args: string[]): ParsedCommands {
  const parsed = parseArgs(args, {
    boolean: ['version', 'help', 'interactive', 'force', 'verbose'],
    string: ['auth', 'data', 'env', 'header', 'H', 'config'],
    alias: {
      h: 'help',
      V: 'version',
      i: 'interactive',
      H: 'header',
      d: 'data',
      a: 'auth',
      e: 'env',
      c: 'config',
      f: 'force',
      v: 'verbose',
    },
    collect: ['header', 'H'],
    stopEarly: false,
  });

  return parsed as ParsedCommands;
}
