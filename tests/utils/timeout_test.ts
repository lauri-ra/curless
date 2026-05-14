import { assertEquals, assertThrows } from "@std/assert";
import { parseTimeoutSeconds } from "../../src/utils/timeout.ts";
import { CurlessError } from "../../src/utils/errors.ts";

Deno.test("parseTimeoutSeconds - returns undefined when input is undefined", () => {
  assertEquals(parseTimeoutSeconds(undefined), undefined);
});

Deno.test("parseTimeoutSeconds - parses positive integer", () => {
  assertEquals(parseTimeoutSeconds("60"), 60);
});

Deno.test("parseTimeoutSeconds - parses positive decimal", () => {
  assertEquals(parseTimeoutSeconds("0.5"), 0.5);
});

Deno.test("parseTimeoutSeconds - rejects zero", () => {
  assertThrows(
    () => parseTimeoutSeconds("0"),
    CurlessError,
    "Invalid --timeout",
  );
});

Deno.test("parseTimeoutSeconds - rejects negative", () => {
  assertThrows(
    () => parseTimeoutSeconds("-1"),
    CurlessError,
    "Invalid --timeout",
  );
});

Deno.test("parseTimeoutSeconds - rejects non-numeric", () => {
  assertThrows(
    () => parseTimeoutSeconds("forever"),
    CurlessError,
    "Invalid --timeout",
  );
});
