---
description: Run the curless green-build gate (test, lint, fmt:check, check).
---

Run the four checks that gate a clean change on this repo, in order, and stop
at the first failure. Report which step failed and the relevant output; if all
four pass, summarize with the test count and confirm a clean run.

1. `deno task test`
2. `deno task lint`
3. `deno task fmt:check`
4. `deno task check`

If `fmt:check` fails, suggest running `deno task fmt` rather than auto-running
it — the user may want to inspect the diff first.

Do not commit or push as part of this command.
