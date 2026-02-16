import { assertEquals, assertNotEquals } from '@std/assert';
import { loadConfig } from '../../src/config/loader.ts';

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
  'loadConfig - returns null when config file does not exist',
  async () => {
    const config = await loadConfig('/definitely/nonexistent/curless.yaml');
    assertEquals(config, null);
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
