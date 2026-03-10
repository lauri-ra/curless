import { assertEquals, assertNotEquals, assertRejects } from '@std/assert';
import { loadConfig } from '../../src/config/loader.ts';
import { CurlessError } from '../../src/utils/errors.ts';

// Note: Test YAML configs omit the `secrets` section so loadSecrets
// is a no-op (it checks config.secrets?.envFile and returns early).

Deno.test('loadConfig - loads config from explicit path', async () => {
  const tempDir = await Deno.makeTempDir();
  const yamlContent = `
environments:
  dev:
    baseUrl: https://test.example.com
    default: true
requests:
  getUsers:
    method: GET
    path: /users
`;
  const configPath = `${tempDir}/curless.yaml`;
  await Deno.writeTextFile(configPath, yamlContent);

  try {
    const config = await loadConfig(configPath);
    assertNotEquals(config, null);
    assertEquals(
      config?.environments?.dev?.baseUrl,
      'https://test.example.com',
    );
    assertEquals(config?.requests?.getUsers?.method, 'GET');
    assertEquals(config?.requests?.getUsers?.path, '/users');
  } finally {
    await Deno.remove(tempDir, { recursive: true });
  }
});

Deno.test(
  'loadConfig - throws when explicit config file does not exist',
  async () => {
    await assertRejects(
      () => loadConfig('/definitely/nonexistent/curless.yaml'),
      CurlessError,
      'was not found',
    );
  },
);

Deno.test(
  'loadConfig - parses multiple environments and requests',
  async () => {
    const tempDir = await Deno.makeTempDir();
    const yamlContent = `
environments:
  dev:
    baseUrl: https://dev.example.com
    default: true
  prod:
    baseUrl: https://prod.example.com
requests:
  getUsers:
    method: GET
    path: /users
  createUser:
    method: POST
    path: /users
    headers:
      Content-Type: application/json
`;
    const configPath = `${tempDir}/curless.yaml`;
    await Deno.writeTextFile(configPath, yamlContent);

    try {
      const config = await loadConfig(configPath);
      assertNotEquals(config, null);
      assertEquals(
        config?.environments?.prod?.baseUrl,
        'https://prod.example.com',
      );
      assertEquals(config?.requests?.createUser?.method, 'POST');
      assertEquals(
        config?.requests?.createUser?.headers?.['Content-Type'],
        'application/json',
      );
    } finally {
      await Deno.remove(tempDir, { recursive: true });
    }
  },
);

Deno.test('loadConfig - throws when discovered config is missing', async () => {
  const tempDir = await Deno.makeTempDir();
  const originalCwd = Deno.cwd();

  try {
    Deno.chdir(tempDir);
    await assertRejects(
      () => loadConfig(),
      CurlessError,
      'Config file was not found',
    );
  } finally {
    Deno.chdir(originalCwd);
    await Deno.remove(tempDir, { recursive: true });
  }
});

Deno.test('loadConfig - throws on invalid YAML', async () => {
  const tempDir = await Deno.makeTempDir();
  const configPath = `${tempDir}/curless.yaml`;
  await Deno.writeTextFile(configPath, 'requests: [broken');

  try {
    await assertRejects(
      () => loadConfig(configPath),
      CurlessError,
      'Failed to parse YAML',
    );
  } finally {
    await Deno.remove(tempDir, { recursive: true });
  }
});
