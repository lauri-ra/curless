import { assertEquals } from '@std/assert';
import { stub, spy } from '@std/testing/mock';
import { handleManualMode } from '../../src/commands/manual_mode.ts';
import { createMockCommands } from '../helpers.ts';

Deno.test(
  'handleManualMode - makes GET request with correct method and URL',
  async () => {
    const mockResponse = new Response('{"result":"ok"}', {
      status: 200,
      statusText: 'OK',
      headers: { 'Content-Type': 'application/json' },
    });
    using fetchStub = stub(globalThis, 'fetch', () =>
      Promise.resolve(mockResponse),
    );
    using _consoleSpy = spy(console, 'log');

    const commands = createMockCommands({
      _: ['GET', 'https://api.example.com/test'],
    });
    await handleManualMode(commands);

    assertEquals(fetchStub.calls.length, 1);
    const calledRequest = fetchStub.calls[0].args[0] as Request;
    assertEquals(calledRequest.method, 'GET');
    assertEquals(calledRequest.url, 'https://api.example.com/test');
  },
);

Deno.test('handleManualMode - sends headers from -H flags', async () => {
  const mockResponse = new Response('', {
    status: 200,
    statusText: 'OK',
  });
  using fetchStub = stub(globalThis, 'fetch', () =>
    Promise.resolve(mockResponse),
  );
  using _consoleSpy = spy(console, 'log');

  const commands = createMockCommands({
    _: ['POST', 'https://api.example.com/data'],
    header: ['Content-Type:application/json', 'Authorization:Bearer token'],
    H: ['Content-Type:application/json', 'Authorization:Bearer token'],
    data: '{"key":"value"}',
  });
  await handleManualMode(commands);

  const calledRequest = fetchStub.calls[0].args[0] as Request;
  assertEquals(calledRequest.method, 'POST');
  assertEquals(calledRequest.headers.get('Content-Type'), 'application/json');
  assertEquals(calledRequest.headers.get('Authorization'), 'Bearer token');
});
