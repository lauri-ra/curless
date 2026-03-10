import { assertEquals } from '@std/assert';
import { formatError } from '../../src/output/error_formatter.ts';
import { CurlessError } from '../../src/utils/errors.ts';

Deno.test('formatError - formats missing config from explicit path', () => {
  const error = new CurlessError(
    'CONFIG_NOT_FOUND',
    'config',
    'Config file missing.',
    { details: { configPath: '/tmp/curless.yaml' } },
  );

  assertEquals(
    formatError(error),
    "Config file not found at '/tmp/curless.yaml'. Check the path passed to --config.",
  );
});

Deno.test('formatError - formats network failures', () => {
  const error = new CurlessError(
    'NETWORK_FAILURE',
    'network',
    'Connection refused',
  );

  assertEquals(formatError(error), 'Request failed: Connection refused');
});

Deno.test('formatError - falls back for unexpected errors', () => {
  assertEquals(formatError(new Error('boom')), 'Unexpected error: boom');
});
