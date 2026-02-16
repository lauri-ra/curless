import { assertStringIncludes, assertEquals } from '@std/assert';
import { spy } from '@std/testing/mock';
import {
  formatResponse,
  printMessage,
} from '../../src/output/response_formatter.ts';

Deno.test('printMessage - error includes message text', () => {
  using consoleSpy = spy(console, 'log');
  printMessage('error', 'Something went wrong');
  assertEquals(consoleSpy.calls.length, 1);
  assertStringIncludes(consoleSpy.calls[0].args[0], 'Something went wrong');
});

Deno.test('printMessage - success includes message text', () => {
  using consoleSpy = spy(console, 'log');
  printMessage('success', 'All good');
  assertEquals(consoleSpy.calls.length, 1);
  assertStringIncludes(consoleSpy.calls[0].args[0], 'All good');
});

Deno.test(
  'formatResponse - prints status line with method and status code',
  async () => {
    using consoleSpy = spy(console, 'log');
    const request = new Request('https://example.com/users', {
      method: 'GET',
    });
    const response = new Response('{}', {
      status: 200,
      statusText: 'OK',
      headers: { 'Content-Type': 'application/json' },
    });
    await formatResponse(request, { response, duration: 42.5 });

    const allOutput = consoleSpy.calls.map((c) => String(c.args[0])).join('\n');
    assertStringIncludes(allOutput, 'GET');
    assertStringIncludes(allOutput, '200');
  },
);

Deno.test('formatResponse - shows body when showBody is true', async () => {
  using consoleSpy = spy(console, 'log');
  const request = new Request('https://example.com/users');
  const response = new Response('{"name":"test"}', {
    status: 200,
    statusText: 'OK',
    headers: { 'Content-Type': 'application/json' },
  });
  await formatResponse(request, { response, duration: 10 }, { showBody: true });

  const allOutput = consoleSpy.calls.map((c) => String(c.args[0])).join('\n');
  assertStringIncludes(allOutput, 'Body');
  assertStringIncludes(allOutput, 'test');
});

Deno.test(
  'formatResponse - shows headers when showHeaders is true',
  async () => {
    using consoleSpy = spy(console, 'log');
    const request = new Request('https://example.com/users');
    const response = new Response('ok', {
      status: 200,
      statusText: 'OK',
      headers: { 'Content-Type': 'text/plain', 'Content-Length': '2' },
    });
    await formatResponse(
      request,
      { response, duration: 10 },
      { showHeaders: true },
    );

    const allOutput = consoleSpy.calls.map((c) => String(c.args[0])).join('\n');
    assertStringIncludes(allOutput, 'Headers');
    assertStringIncludes(allOutput, 'content-type');
  },
);
