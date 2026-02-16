import { assertEquals } from '@std/assert';
import { loadSecrets, getSecret } from '../../src/config/secrets.ts';
import { Config } from '../../src/utils/types.ts';

Deno.test('secrets - loadSecrets and getSecret round-trip', async () => {
  const tempDir = await Deno.makeTempDir();
  const envPath = `${tempDir}/.env`;
  await Deno.writeTextFile(envPath, 'API_KEY=test-key-123\nOTHER_SECRET=other-value');

  const config: Config = { secrets: { envFile: '.env' } };
  const configPath = `${tempDir}/curless.yaml`;

  await loadSecrets(config, configPath);

  assertEquals(getSecret('API_KEY'), 'test-key-123');
  assertEquals(getSecret('OTHER_SECRET'), 'other-value');
  assertEquals(getSecret('NONEXISTENT'), undefined);

  await Deno.remove(tempDir, { recursive: true });
});

Deno.test('secrets - loadSecrets with no envFile in config is a no-op', async () => {
  const config: Config = {};
  await loadSecrets(config, '/fake/path/curless.yaml');
  // Should not throw
});

Deno.test('secrets - loadSecrets with missing env file does not throw', async () => {
  const config: Config = { secrets: { envFile: 'nonexistent.env' } };
  // @std/dotenv load() silently handles missing files — should not throw
  await loadSecrets(config, '/fake/path/curless.yaml');
});
