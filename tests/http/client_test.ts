import { assertEquals, assertRejects } from '@std/assert';
import { stub } from '@std/testing/mock';
import { executeRequest } from '../../src/http/client.ts';

Deno.test('executeRequest - returns response and duration', async () => {
  const mockResponse = new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
  using _fetchStub = stub(globalThis, 'fetch', () =>
    Promise.resolve(mockResponse),
  );

  const request = new Request('https://example.com/api');
  const result = await executeRequest(request);

  assertEquals(result.response.status, 200);
  assertEquals(typeof result.duration, 'number');
  assertEquals(result.duration >= 0, true);
});

Deno.test('executeRequest - propagates fetch errors', async () => {
  using _fetchStub = stub(globalThis, 'fetch', () =>
    Promise.reject(new Error('Network error')),
  );

  const request = new Request('https://example.com/api');
  await assertRejects(() => executeRequest(request), Error, 'Network error');
});

Deno.test('executeRequest - measures duration as positive number', async () => {
  using _fetchStub = stub(globalThis, 'fetch', () =>
    Promise.resolve(new Response('ok')),
  );

  const request = new Request('https://example.com/api');
  const result = await executeRequest(request);
  assertEquals(result.duration >= 0, true);
});
