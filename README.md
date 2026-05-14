# Curless

#### Keywords and marketing speech

Config-First Philosophy

"Makefile for APIs"

Attempt to make this as plug-n-play as possible.

All you need to do is curless init, fill in the config and start calling APIs.
Alternatively use the manual mode.

#### Motivation

The market is crowded: HTTPie, curl, Insomnia, Postman, REST Client (VS Code),
Bruno... the list goes on. I know that I am not solving a problem that doesn't
have existing well made solutions.

This idea came into my mind from my own workflow. I often work in different
projects with different backends. I like to do stuff from the CLI using my
keyboard.

Postman is an amazing tool, but heavy, requires logins and most importantly GUI
requires mouse to use.

HTTPie CLI tool seemed great but testing APIs in different environments with
different input payloads gets cumbersome because you have to write everything
into the terminal. Kinda same with Curl. There was not an option to save
collections or configurations with the CLI tool when I tested it.

In the end of the day, I want this to work for me and fun creating it.

#### Why Deno?

- TypeScript and great parser support out of the box.
- Minimal configuration.
- Deno compile: even though has larger binary, easy cross platform distribution.
- Performance really not an issue, since most time is spent waiting for requests
  to resolve. Configs are small, so need for heavy I/O operations.
- Wanted to try something new.

#### Usage

See [USAGE.md](./USAGE.md) for command examples, config-mode details, and
`--data` behavior.

Example response you get (default)

```
  > POST https://jsonplaceholder.typicode.com/posts
  ✔ 201 Created  295.71 (ms)

  Headers
    cache-control: no-cache
    content-length: 15
    content-type: application/json; charset=utf-8
    date: Sat, 09 Aug 2025 09:09:21 GMT
    location: https://jsonplaceholder.typicode.com/posts/101

  Body
  {
    "id": 101
  }
```

Suggested Alias For a faster workflow, we recommend adding an alias for curless.
Here are a few popular options:

```
1 # For Bash, add to your ~/.bashrc
2 # For Zsh, add to your ~/.zshrc
3
4 alias cl='curless'
```

Then, you can simply use cl or cu instead of curless.

## Features

Yaml configuration

- Environments (dev, prod)
- Predefined request aliases
- JSON data payload templates
- Shareable so you can get new teammates going fast

Secrets Management

- Load API keys from a `.env` file referenced by `curless.yaml`.
- `${SECRET_NAME}` interpolation in request headers.

Auth helpers

- `--auth basic:USER:PASSWORD` and `--auth bearer:TOKEN` produce the right
  `Authorization` header. Explicit `-H Authorization:` still wins.

Timeouts

- Every request is aborted after 30 seconds by default. Override with
  `--timeout <seconds>` / `-t`.

Verbose mode

- `-v` / `--verbose` prints response headers alongside the body.

Styled output

- Status, duration, headers, and pretty-printed JSON/XML/text bodies.
- `curless list` prints the configured request names, methods, and paths.

#### Experimental

- `curless --migrate postman.json` imports a flat Postman v2.1 collection into
  `curless.postman.yaml`. Bodies, variables, auth, and nested folders are not
  yet handled — see ROADMAP.md.

#### Roadmap

The 1.0 plan, current gaps, and post-1.0 ideas live in
[ROADMAP.md](./ROADMAP.md).
