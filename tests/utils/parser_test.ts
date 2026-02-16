import { assertEquals } from '@std/assert';
import { parseCliArgs } from '../../src/utils/parser.ts';

Deno.test('parseCliArgs - positional arguments', () => {
  const result = parseCliArgs(['GET', 'https://example.com']);
  assertEquals(result._, ['GET', 'https://example.com']);
});

Deno.test('parseCliArgs - empty args', () => {
  const result = parseCliArgs([]);
  assertEquals(result._, []);
  assertEquals(result.help, false);
  assertEquals(result.version, false);
  assertEquals(result.verbose, false);
});

Deno.test('parseCliArgs - help flag and alias', () => {
  assertEquals(parseCliArgs(['--help']).help, true);
  assertEquals(parseCliArgs(['-h']).help, true);
});

Deno.test('parseCliArgs - version flag and alias', () => {
  assertEquals(parseCliArgs(['--version']).version, true);
  assertEquals(parseCliArgs(['-V']).version, true);
});

Deno.test('parseCliArgs - verbose flag and alias', () => {
  assertEquals(parseCliArgs(['--verbose']).verbose, true);
  assertEquals(parseCliArgs(['-v']).verbose, true);
});

Deno.test('parseCliArgs - force flag and alias', () => {
  assertEquals(parseCliArgs(['--force']).force, true);
  assertEquals(parseCliArgs(['-f']).force, true);
});

Deno.test('parseCliArgs - interactive flag and alias', () => {
  assertEquals(parseCliArgs(['--interactive']).interactive, true);
  assertEquals(parseCliArgs(['-i']).interactive, true);
});

Deno.test('parseCliArgs - env string flag and alias', () => {
  assertEquals(parseCliArgs(['--env', 'prod']).env, 'prod');
  assertEquals(parseCliArgs(['-e', 'dev']).env, 'dev');
});

Deno.test('parseCliArgs - data string flag and alias', () => {
  assertEquals(parseCliArgs(['--data', '{"a":1}']).data, '{"a":1}');
  assertEquals(parseCliArgs(['-d', 'body']).data, 'body');
});

Deno.test('parseCliArgs - config flag and alias', () => {
  assertEquals(parseCliArgs(['--config', '/path/to/config.yaml']).config, '/path/to/config.yaml');
  assertEquals(parseCliArgs(['-c', './curless.yaml']).config, './curless.yaml');
});

Deno.test('parseCliArgs - migrate flag', () => {
  assertEquals(parseCliArgs(['--migrate', 'postman.json']).migrate, 'postman.json');
});

Deno.test('parseCliArgs - headers collected into array', () => {
  const result = parseCliArgs(['-H', 'Content-Type:application/json', '-H', 'Authorization:Bearer xyz']);
  assertEquals(result.header, ['Content-Type:application/json', 'Authorization:Bearer xyz']);
  assertEquals(result.H, ['Content-Type:application/json', 'Authorization:Bearer xyz']);
});

Deno.test('parseCliArgs - single header is still an array', () => {
  const result = parseCliArgs(['-H', 'Accept:text/html']);
  assertEquals(result.header, ['Accept:text/html']);
});

Deno.test('parseCliArgs - unknown flags preserved for query params', () => {
  const result = parseCliArgs(['getUsers', '--page', '2', '--limit', '10']);
  assertEquals(result._, ['getUsers']);
  assertEquals(result.page, 2);
  assertEquals(result.limit, 10);
});

Deno.test('parseCliArgs - combined positional args and flags', () => {
  const result = parseCliArgs(['getUserById:123', '--env', 'prod', '-v']);
  assertEquals(result._, ['getUserById:123']);
  assertEquals(result.env, 'prod');
  assertEquals(result.verbose, true);
});
