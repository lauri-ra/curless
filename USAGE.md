# Usage Guide

## Quick Start

Create the default config in the current directory:

```bash
curless init
```

`curless` finds `curless.yaml` by walking upward from the current directory. Use
`--config <path>` to point at a specific file.

List all configured requests:

```bash
curless list
```

## Manual Mode

Send a raw HTTP request directly:

```bash
curless POST https://jsonplaceholder.typicode.com/posts \
  -H "Authorization: Bearer xyz" \
  -d '{"name":"Alice"}'
```

## Authentication

`--auth` accepts two schemes and sets the `Authorization` header for you:

```bash
# Bearer token
curless getUser --env prod --auth bearer:$TOKEN

# HTTP Basic — base64-encodes user:password for you
curless adminPing --env prod --auth basic:admin:$PASSWORD
```

Precedence:

- An explicit `-H Authorization: ...` on the command line always wins over
  `--auth`.
- In config mode, `--auth` overrides any `Authorization` header set on the
  configured request.

## Config Mode

Use a request alias from `curless.yaml`:

```bash
curless getComments --postId=1 --env dev
curless getPostById:5 --env dev
```

## How `--data` Works

The default `curless.yaml` created by `curless init` includes these request
definitions:

```yaml
requests:
  createPost:
    method: POST
    path: /posts
    data_template: new_post_payload
  updatePost:
    method: PUT
    path: /posts/{postId}
    data_template: updated_post_payload

data_templates:
  new_post_payload:
    title: foo
    body: bar
    userId: 1
  updated_post_payload:
    id: 1
    title: foo updated
    body: bar updated
    userId: 1
```

In config mode, `--data` is resolved in this order:

1. Raw JSON passed to `--data`
2. A template name from `data_templates`
3. The request's own `data_template`
4. The request's inline `data` value, if present

Examples with the generated config:

```bash
# Uses createPost.data_template => new_post_payload
curless createPost --env dev

# Overrides createPost.data_template with another template
curless createPost --env dev --data updated_post_payload

# Sends raw JSON instead of looking up a template
curless createPost --env dev --data '{"title":"custom","body":"from cli","userId":42}'

# updatePost already has a default body template and a path param
curless updatePost:1 --env dev
```

In manual mode, `--data` is always sent as-is:

```bash
curless POST https://jsonplaceholder.typicode.com/posts \
  -d '{"title":"manual mode"}'

curless POST https://jsonplaceholder.typicode.com/posts \
  -d 'plain text body'
```

## Example Response

```text
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

## Experimental: Postman import

`--migrate <file>` imports a Postman v2.1 collection JSON into a
`curless.postman.yaml` file. This is experimental and currently handles flat
collections only — request bodies, variables, auth, and nested folders are
**not** yet supported.

```bash
curless --migrate ./MyApi.postman_collection.json
curless --migrate ./MyApi.postman_collection.json --baseUrl https://api.example.com
```
