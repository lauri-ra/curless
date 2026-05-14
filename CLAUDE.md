# Claude Code Guide for curless

This file orients Claude Code (and any agentic assistant) to the curless
repository. Read it before making changes.

## What curless is

curless is a config-driven CLI HTTP client written in TypeScript on Deno. Users
commit a `curless.yaml` describing environments and named requests, then run
`curless <requestName>` from the terminal. There is also a manual mode
(`curless GET https://...`) for one-off requests.

The 1.0 plan, gaps, and post-1.0 ideas live in [ROADMAP.md](./ROADMAP.md). The
roadmap is the source of truth for what we are building next; consult it before
proposing larger changes.

## Layout

- `main.ts` — entrypoint; delegates to `src/CLI.ts`.
- `src/CLI.ts` — top-level command dispatch (help, version, init, list,
  migrate, manual mode, config mode).
- `src/commands/` — one file per top-level command.
- `src/config/` — config discovery, loading, and secrets resolution.
- `src/http/` — request building (`request_builder.ts`) and execution
  (`client.ts`).
- `src/output/` — response formatting and error formatting.
- `src/utils/` — parser, types, errors, small helpers (`auth.ts`,
  `timeout.ts`).
- `tests/` — mirrors `src/` layout; one test file per source file.

## Tooling

All checks are Deno tasks defined in `deno.jsonc`:

| Command | Purpose |
| --- | --- |
| `deno task test` | Run the unit-test suite. |
| `deno task lint` | Lint via `deno lint`. |
| `deno task fmt` | Format the repo in place. |
| `deno task fmt:check` | Verify formatting matches `deno fmt` defaults. |
| `deno task check` | Type-check the entrypoint. |
| `deno task start` | Run the CLI from source. |
| `deno task compile` | Produce a single-file binary. |

A change is "green" when **test, lint, fmt:check, and check** all pass. The
`/verify` slash command runs all four in order.

## Conventions

### Truthfulness

Help text, README, and USAGE.md must only describe behavior that is actually
implemented. Half-finished flags get hidden, removed, or clearly marked
**EXPERIMENTAL** — never advertised as ready. If you remove a flag, scrub it
from parser, types, docs, and help text.

### Errors

User-facing errors go through `CurlessError` (`src/utils/errors.ts`). Each
error has a `code` (string union), a `category` (`user | config | network |
internal`), and an optional `details` payload. New error paths should:

1. Add the code to the `CurlessErrorCode` union.
2. Throw `new CurlessError(code, category, message, { details })`.
3. Add a case in `formatError` (`src/output/error_formatter.ts`) so the
   message renders cleanly instead of falling through to "Unexpected error".

### Tests

- One test file per source file in the matching `tests/` subdirectory.
- Prefer `using ... = stub(...)` from `@std/testing/mock` for isolating
  `Deno.*` calls and `fetch`.
- Use the helpers in `tests/helpers.ts` (`createMockConfig`,
  `createMockCommands`) instead of hand-rolling fixtures.

### Style

- Match Deno's default formatter — do not introduce custom prettier configs.
- Avoid `any`; prefer narrow union types or `unknown` with explicit casts.
- No inline `jsr:` imports in source files; add an entry to the import map in
  `deno.jsonc`.

## Commit and PR policy

- Commit messages: plain prose describing the *why*, not the *what*. Match the
  style of recent commits (`git log --oneline -10`).
- Do not commit `ROADMAP.md` revisions casually — it's the planning document,
  not a per-PR changelog. Discuss roadmap changes explicitly.
- Keep PRs focused on a single roadmap step where possible.

## Roadmap workflow

When working through ROADMAP.md, the suggested loop is:

1. Read the next unchecked step.
2. Surface forks (the roadmap intentionally leaves some open) before coding.
3. Implement, add tests, update docs in the same change.
4. Run `/verify` (or the four tasks manually).
5. Commit per the policy above.

## Permissions

`.claude/settings.json` pre-approves the safe read-only Deno commands so
teammates aren't prompted on every check. Personal overrides go in
`.claude/settings.local.json`, which is gitignored.
