import { parseArgs } from 'jsr:@std/cli/parse-args';
import { ParsedCommands } from './types.ts';

export function parseCliArgs(args: string[]): ParsedCommands {
  const parsed = parseArgs(args, {
    boolean: ['version', 'help', 'interactive'],
    string: ['auth', 'data', 'env', 'header', 'H'],
    alias: {
      h: 'help',
      v: 'version',
      i: 'interactive',
      H: 'header',
      d: 'data',
      a: 'auth',
      e: 'env',
    },
    collect: ['header', 'H'],
    stopEarly: false,
  });

  return parsed as ParsedCommands;
}
