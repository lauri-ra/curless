import { assertEquals, assertThrows } from '@std/assert';
import { resolveRequestDetails } from '../../src/http/request_builder.ts';
import { createMockConfig, createMockCommands } from '../helpers.ts';

// --- Basic request resolution ---

Deno.test('resolveRequestDetails - simple request name resolves to correct method and URL', () => {
  const config = createMockConfig();
  const commands = createMockCommands({ _: ['getUsers'] });
  const request = resolveRequestDetails(config, commands);

  assertEquals(request.method, 'GET');
  assertEquals(request.url, 'https://api.example.com/users');
});

Deno.test('resolveRequestDetails - request with single path parameter', () => {
  const config = createMockConfig({
    requests: {
      getUserById: { method: 'GET', path: '/users/{userId}' },
    },
  });
  const commands = createMockCommands({ _: ['getUserById:123'] });
  const request = resolveRequestDetails(config, commands);

  assertEquals(request.url, 'https://api.example.com/users/123');
});

Deno.test('resolveRequestDetails - request with multiple path parameters', () => {
  const config = createMockConfig({
    requests: {
      getUserPost: { method: 'GET', path: '/users/{userId}/posts/{postId}' },
    },
  });
  const commands = createMockCommands({ _: ['getUserPost:42:7'] });
  const request = resolveRequestDetails(config, commands);

  assertEquals(request.url, 'https://api.example.com/users/42/posts/7');
});

Deno.test('resolveRequestDetails - method is uppercased from config', () => {
  const config = createMockConfig({
    requests: {
      createUser: { method: 'post', path: '/users' },
    },
  });
  const commands = createMockCommands({ _: ['createUser'] });
  const request = resolveRequestDetails(config, commands);

  assertEquals(request.method, 'POST');
});

// --- Error cases ---

Deno.test('resolveRequestDetails - throws when request name not provided', () => {
  const config = createMockConfig();
  const commands = createMockCommands({ _: [] });

  assertThrows(
    () => resolveRequestDetails(config, commands),
    Error,
    'Request name not provided',
  );
});

Deno.test('resolveRequestDetails - throws for unknown request name', () => {
  const config = createMockConfig();
  const commands = createMockCommands({ _: ['nonExistent'] });

  assertThrows(
    () => resolveRequestDetails(config, commands),
    Error,
    "not found in configuration",
  );
});

Deno.test('resolveRequestDetails - throws when too few path params', () => {
  const config = createMockConfig({
    requests: {
      getUserById: { method: 'GET', path: '/users/{userId}' },
    },
  });
  const commands = createMockCommands({ _: ['getUserById'] });

  assertThrows(
    () => resolveRequestDetails(config, commands),
    Error,
    'requires 1 parameter(s), but 0 were given',
  );
});

Deno.test('resolveRequestDetails - throws when too many path params', () => {
  const config = createMockConfig({
    requests: {
      getUserById: { method: 'GET', path: '/users/{userId}' },
    },
  });
  const commands = createMockCommands({ _: ['getUserById:1:2'] });

  assertThrows(
    () => resolveRequestDetails(config, commands),
    Error,
    'requires 1 parameter(s), but 2 were given',
  );
});

// --- Environment resolution ---

Deno.test('resolveRequestDetails - uses explicit --env flag', () => {
  const config = createMockConfig({
    environments: {
      dev: { baseUrl: 'https://dev.example.com' },
      prod: { baseUrl: 'https://prod.example.com' },
    },
  });
  const commands = createMockCommands({ _: ['getUsers'], env: 'prod' });
  const request = resolveRequestDetails(config, commands);

  assertEquals(new URL(request.url).origin, 'https://prod.example.com');
});

Deno.test('resolveRequestDetails - uses default environment when no --env', () => {
  const config = createMockConfig({
    environments: {
      dev: { baseUrl: 'https://dev.example.com' },
      prod: { baseUrl: 'https://prod.example.com', default: true },
    },
  });
  const commands = createMockCommands({ _: ['getUsers'] });
  const request = resolveRequestDetails(config, commands);

  assertEquals(new URL(request.url).origin, 'https://prod.example.com');
});

Deno.test('resolveRequestDetails - throws when --env points to non-existent env', () => {
  const config = createMockConfig();
  const commands = createMockCommands({ _: ['getUsers'], env: 'staging' });

  assertThrows(
    () => resolveRequestDetails(config, commands),
    Error,
    "Environment 'staging' not found",
  );
});

Deno.test('resolveRequestDetails - throws when no environments defined', () => {
  const config = createMockConfig({ environments: {} });
  const commands = createMockCommands({ _: ['getUsers'] });

  assertThrows(
    () => resolveRequestDetails(config, commands),
    Error,
    'No envrionments specified',
  );
});

Deno.test('resolveRequestDetails - throws when no default env and no --env flag', () => {
  const config = createMockConfig({
    environments: {
      dev: { baseUrl: 'https://dev.example.com' },
      prod: { baseUrl: 'https://prod.example.com' },
    },
  });
  const commands = createMockCommands({ _: ['getUsers'] });

  assertThrows(
    () => resolveRequestDetails(config, commands),
    Error,
    'Environment not specified',
  );
});

// --- Query parameters ---

Deno.test('resolveRequestDetails - unknown CLI flags become query params', () => {
  const config = createMockConfig();
  const commands = createMockCommands({
    _: ['getUsers'],
    page: 2,
    limit: 10,
  } as Partial<typeof commands>);
  const request = resolveRequestDetails(config, commands);
  const url = new URL(request.url);

  assertEquals(url.searchParams.get('page'), '2');
  assertEquals(url.searchParams.get('limit'), '10');
});

Deno.test('resolveRequestDetails - known flags excluded from query string', () => {
  const config = createMockConfig();
  const commands = createMockCommands({ _: ['getUsers'], env: 'dev', verbose: true });
  const request = resolveRequestDetails(config, commands);
  const url = new URL(request.url);

  assertEquals(url.searchParams.has('env'), false);
  assertEquals(url.searchParams.has('verbose'), false);
});

// --- URL construction ---

Deno.test('resolveRequestDetails - trailing slash on baseUrl is normalized', () => {
  const config = createMockConfig({
    environments: {
      dev: { baseUrl: 'https://api.example.com/', default: true },
    },
  });
  const commands = createMockCommands({ _: ['getUsers'] });
  const request = resolveRequestDetails(config, commands);

  assertEquals(request.url, 'https://api.example.com/users');
});

// --- Data templates ---

Deno.test('resolveRequestDetails - body from data template', async () => {
  const config = createMockConfig({
    requests: {
      createUser: { method: 'POST', path: '/users' },
    },
    data_templates: {
      newUser: { name: 'Alice', age: 30 },
    },
  });
  const commands = createMockCommands({ _: ['createUser'], data: 'newUser' });
  const request = resolveRequestDetails(config, commands);

  assertEquals(request.method, 'POST');
  const body = await request.text();
  assertEquals(JSON.parse(body), { name: 'Alice', age: 30 });
});

Deno.test('resolveRequestDetails - throws for non-existent data template', () => {
  const config = createMockConfig({
    requests: {
      createUser: { method: 'POST', path: '/users' },
    },
  });
  const commands = createMockCommands({ _: ['createUser'], data: 'nonExistent' });

  assertThrows(
    () => resolveRequestDetails(config, commands),
    Error,
    "Data template 'nonExistent' not found",
  );
});

Deno.test('resolveRequestDetails - body from request data_template field (no CLI flag)', async () => {
  const config = createMockConfig({
    requests: {
      createUser: { method: 'POST', path: '/users', data_template: 'newUser' },
    },
    data_templates: {
      newUser: { name: 'Alice', age: 30 },
    },
  });
  const commands = createMockCommands({ _: ['createUser'] });
  const request = resolveRequestDetails(config, commands);

  const body = await request.text();
  assertEquals(JSON.parse(body), { name: 'Alice', age: 30 });
});

Deno.test('resolveRequestDetails - CLI --data overrides request data_template', async () => {
  const config = createMockConfig({
    requests: {
      createUser: { method: 'POST', path: '/users', data_template: 'newUser' },
    },
    data_templates: {
      newUser: { name: 'Alice', age: 30 },
      otherUser: { name: 'Bob', age: 25 },
    },
  });
  const commands = createMockCommands({ _: ['createUser'], data: 'otherUser' });
  const request = resolveRequestDetails(config, commands);

  const body = await request.text();
  assertEquals(JSON.parse(body), { name: 'Bob', age: 25 });
});

Deno.test('resolveRequestDetails - CLI --data with raw JSON string', async () => {
  const config = createMockConfig({
    requests: {
      createUser: { method: 'POST', path: '/users' },
    },
  });
  const commands = createMockCommands({ _: ['createUser'], data: '{"name":"Charlie"}' });
  const request = resolveRequestDetails(config, commands);

  const body = await request.text();
  assertEquals(JSON.parse(body), { name: 'Charlie' });
});

Deno.test('resolveRequestDetails - inline data on request definition', async () => {
  const config = createMockConfig({
    requests: {
      createUser: { method: 'POST', path: '/users', data: { name: 'Dave', age: 40 } },
    },
  });
  const commands = createMockCommands({ _: ['createUser'] });
  const request = resolveRequestDetails(config, commands);

  const body = await request.text();
  assertEquals(JSON.parse(body), { name: 'Dave', age: 40 });
});

Deno.test('resolveRequestDetails - data_template takes priority over inline data', async () => {
  const config = createMockConfig({
    requests: {
      createUser: {
        method: 'POST',
        path: '/users',
        data_template: 'tmpl',
        data: { name: 'Inline' },
      },
    },
    data_templates: {
      tmpl: { name: 'Template' },
    },
  });
  const commands = createMockCommands({ _: ['createUser'] });
  const request = resolveRequestDetails(config, commands);

  const body = await request.text();
  assertEquals(JSON.parse(body), { name: 'Template' });
});
