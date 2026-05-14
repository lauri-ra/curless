import { assertEquals, assertRejects } from "@std/assert";
import { stub } from "@std/testing/mock";
import { executeRequest } from "../../src/http/client.ts";
import { CurlessError } from "../../src/utils/errors.ts";

Deno.test("executeRequest - returns response and duration", async () => {
  const mockResponse = new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
  using _fetchStub = stub(
    globalThis,
    "fetch",
    () => Promise.resolve(mockResponse),
  );

  const request = new Request("https://example.com/api");
  const result = await executeRequest(request);

  assertEquals(result.response.status, 200);
  assertEquals(typeof result.duration, "number");
  assertEquals(result.duration >= 0, true);
});

Deno.test("executeRequest - propagates fetch errors", async () => {
  using _fetchStub = stub(
    globalThis,
    "fetch",
    () => Promise.reject(new Error("Network error")),
  );

  const request = new Request("https://example.com/api");
  await assertRejects(
    () => executeRequest(request),
    CurlessError,
    "Network error",
  );
});

Deno.test("executeRequest - measures duration as positive number", async () => {
  using _fetchStub = stub(
    globalThis,
    "fetch",
    () => Promise.resolve(new Response("ok")),
  );

  const request = new Request("https://example.com/api");
  const result = await executeRequest(request);
  assertEquals(result.duration >= 0, true);
});

Deno.test("executeRequest - aborts and throws TIMEOUT when fetch outlasts timeout", async () => {
  using _fetchStub = stub(
    globalThis,
    "fetch",
    (_input: string | URL | Request, init?: RequestInit) => {
      return new Promise<Response>((_resolve, reject) => {
        const signal = init?.signal;
        if (!signal) return;
        signal.addEventListener("abort", () => {
          reject(new DOMException("Aborted", "AbortError"));
        });
      });
    },
  );

  const request = new Request("https://example.com/api");
  const error = await assertRejects(
    () => executeRequest(request, { timeoutSeconds: 0.01 }),
    CurlessError,
    "Request timed out",
  );
  assertEquals((error as CurlessError).code, "TIMEOUT");
});

Deno.test("executeRequest - non-timeout abort still surfaces NETWORK_FAILURE", async () => {
  using _fetchStub = stub(
    globalThis,
    "fetch",
    () => Promise.reject(new DOMException("Aborted", "AbortError")),
  );

  const request = new Request("https://example.com/api");
  const error = await assertRejects(
    () => executeRequest(request, { timeoutSeconds: 30 }),
    CurlessError,
  );
  assertEquals((error as CurlessError).code, "NETWORK_FAILURE");
});

Deno.test("executeRequest - default timeout used when none provided", async () => {
  // Confirm executeRequest still completes a normal request without a timeout
  // option, exercising the DEFAULT_TIMEOUT_SECONDS branch.
  using _fetchStub = stub(
    globalThis,
    "fetch",
    () => Promise.resolve(new Response("ok")),
  );

  const request = new Request("https://example.com/api");
  const result = await executeRequest(request);
  assertEquals(result.response.status, 200);
});
