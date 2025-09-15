# Curless

#### Keywords and marketing speech
Config-First Philosophy

"Makefile for APIs"

Attempt to make this as plug-n-play as possible.

All you need to do is curless init, fill in the config and start calling APIs.
Alternatively use the manual mode.

## Features

Yaml configuration
* Environments (dev, prod)
* Predefined request aliases
* JSON data payload templates
* Shareable so you can get new teammates going fast

Secrets Management
* Load API keys from .env, local.settings.json, etc.
* Safe interpolation into config files

Interactive Mode
* Opens request data in your default editor before submission ($EDITOR). (WIP)

Verbose/Debug Mode
* Clearly see full request details and headers for debugging.

Styled Output
* Beautiful CLI response with syntax highlighting, status codes, headers.
* Command to output the current functions / endpoints in the configuration

Migrate Collections
* Currenyly supports Postman collection (WIP)

## Motivation
The market is crowded: HTTPie, curl, Insomnia, Postman, VScode REST Client, Bruno... the list goes on. I know that I am not solving a problem that doesn't have existing well made solutions.

This idea came into my mind from my own workflow.
I often work in different projects with different backends.
I like to do stuff from the CLI using my keyboard.

Postman is an amazing tool, but heavy, requires logins and most importantly GUI requires  mouse to use.

HTTPie CLI tool seemed great but testing APIs in different environments with different input payloads gets cumbersome because you have to write everything into the terminal. Kinda same with Curl. There was not an option to save collections or configurations with the CLI tool when I tested it.

In the end of the day, I want this to work for me and fun creating it.

## Why Deno?
- TypeScript and great parser support out of the box.
- Minimal configuration.
- Deno compile: even though has larger binary, easy cross platform distribution.
- Performance really not an issue, since most time is spent waiting for requests to resolve. Configs are small, so need for heavy I/O operations.
- Wanted to try something new.

## Usage

Create a config file placeholder / example like this
```
  curless init
```

Manual mode
```
curless POST https://jsonplaceholder.typicode.com/posts \
    -H "Authorization: Bearer xyz" \
    -d '{"name":"Alice"}'
```

Config mode with query params:
```
  curless getComments --postId=1 --env dev
```

Config mode with path params:
```
  curless getPostById:5 --env dev
```

Create a config file from a Postman collection
```
  curless migrate <path_to_postman_collection.json>
```

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

Suggested Alias
For a faster workflow, I'd recommend adding an alias for curless, like this:
```
   1 # For Bash, add to your ~/.bashrc
   2 # For Zsh, add to your ~/.zshrc
   3
   4 alias cl='curless'
```
  Then, you can simply use cl or cu instead of curless.
