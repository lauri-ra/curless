import { assertEquals, assertThrows } from "@std/assert";
import { buildAuthHeader } from "../../src/utils/auth.ts";
import { CurlessError } from "../../src/utils/errors.ts";

Deno.test("buildAuthHeader - basic encodes user:password", () => {
  const [key, value] = buildAuthHeader("basic:alice:s3cret");
  assertEquals(key, "Authorization");
  assertEquals(value, `Basic ${btoa("alice:s3cret")}`);
});

Deno.test("buildAuthHeader - basic preserves colons inside password", () => {
  const [, value] = buildAuthHeader("basic:alice:pa:ss:word");
  assertEquals(value, `Basic ${btoa("alice:pa:ss:word")}`);
});

Deno.test("buildAuthHeader - basic encodes utf-8 passwords", () => {
  const [, value] = buildAuthHeader("basic:user:pässwörd");
  const expected = btoa(
    String.fromCharCode(...new TextEncoder().encode("user:pässwörd")),
  );
  assertEquals(value, `Basic ${expected}`);
});

Deno.test("buildAuthHeader - basic without password throws AUTH_INVALID", () => {
  assertThrows(
    () => buildAuthHeader("basic:alice"),
    CurlessError,
    "Invalid --auth value 'basic:alice'",
  );
});

Deno.test("buildAuthHeader - bearer returns token verbatim", () => {
  const [key, value] = buildAuthHeader("bearer:abc123");
  assertEquals(key, "Authorization");
  assertEquals(value, "Bearer abc123");
});

Deno.test("buildAuthHeader - bearer without token throws AUTH_INVALID", () => {
  assertThrows(
    () => buildAuthHeader("bearer:"),
    CurlessError,
    "Invalid --auth value 'bearer:'",
  );
});

Deno.test("buildAuthHeader - unknown scheme throws AUTH_UNSUPPORTED", () => {
  assertThrows(
    () => buildAuthHeader("digest:user:pass"),
    CurlessError,
    "Unsupported --auth scheme 'digest'",
  );
});

Deno.test("buildAuthHeader - scheme is case-insensitive", () => {
  const [, value] = buildAuthHeader("BEARER:tok");
  assertEquals(value, "Bearer tok");
});
