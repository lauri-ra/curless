import { assertEquals } from '@std/assert';
import { stub, spy } from '@std/testing/mock';
import { handleConfigMode } from '../../src/commands/config_mode.ts';
import { createMockCommands } from '../helpers.ts';

Deno.test('handleConfigMode - returns null when config not found', async () => {
  // loadConfig traverses dirs looking for curless.yaml.
  // In a temp dir with no config, it returns null.
  // We stub Deno.cwd to return a temp dir with no curless.yaml.
  const tempDir = await Deno.makeTempDir();
  const cwdStub = stub(Deno, 'cwd', () => tempDir);
  const consoleSpy = spy(console, 'log');

  try {
    const commands = createMockCommands({ _: ['getUsers'] });
    const result = await handleConfigMode(commands);
    assertEquals(result, null);
  } finally {
    cwdStub.restore();
    consoleSpy.restore();
    await Deno.remove(tempDir, { recursive: true });
  }
});

Deno.test(
  'handleConfigMode - executes request when config is found',
  async () => {
    const tempDir = await Deno.makeTempDir();
    const yamlContent = `
environments:
  dev:
    baseUrl: https://api.example.com
    default: true
requests:
  getUsers:
    method: GET
    path: /users
`;
    await Deno.writeTextFile(`${tempDir}/curless.yaml`, yamlContent);

    const cwdStub = stub(Deno, 'cwd', () => tempDir);
    const mockResponse = new Response('{"users":[]}', {
      status: 200,
      statusText: 'OK',
      headers: { 'Content-Type': 'application/json' },
    });
    const fetchStub = stub(globalThis, 'fetch', () =>
      Promise.resolve(mockResponse),
    );
    const consoleSpy = spy(console, 'log');

    try {
      const commands = createMockCommands({ _: ['getUsers'] });
      await handleConfigMode(commands);
      assertEquals(fetchStub.calls.length, 1);
    } finally {
      cwdStub.restore();
      fetchStub.restore();
      consoleSpy.restore();
      await Deno.remove(tempDir, { recursive: true });
    }
  },
);
