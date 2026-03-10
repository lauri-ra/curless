import { assertStringIncludes } from '@std/assert';
import { spy } from '@std/testing/mock';
import { listRequests } from '../../src/commands/list_command.ts';
import { stringify } from 'jsr:@std/yaml/stringify';
import { Config } from '../../src/utils/types.ts';

function createTempConfig(config: Config): string {
  const yaml = stringify(config);
  const tmpFile = Deno.makeTempFileSync({ suffix: '.yaml' });
  Deno.writeTextFileSync(tmpFile, yaml);
  return tmpFile;
}

Deno.test('listRequests - prints request names, methods, and paths', async () => {
  const configPath = createTempConfig({
    environments: { dev: { baseUrl: 'https://example.com', default: true } },
    requests: {
      getUsers: { method: 'GET', path: '/users' },
      createPost: { method: 'POST', path: '/posts' },
    },
  });

  using consoleSpy = spy(console, 'log');
  await listRequests(configPath);

  const output = consoleSpy.calls.map((c) => c.args[0]).join('\n');
  assertStringIncludes(output, 'getUsers');
  assertStringIncludes(output, '/users');
  assertStringIncludes(output, 'createPost');
  assertStringIncludes(output, '/posts');

  Deno.removeSync(configPath);
});

Deno.test('listRequests - shows error when no requests defined', async () => {
  const configPath = createTempConfig({
    environments: { dev: { baseUrl: 'https://example.com', default: true } },
    requests: {},
  });

  using consoleSpy = spy(console, 'log');
  await listRequests(configPath);

  const output = consoleSpy.calls.map((c) => c.args[0]).join('\n');
  assertStringIncludes(output, 'No requests defined');

  Deno.removeSync(configPath);
});
