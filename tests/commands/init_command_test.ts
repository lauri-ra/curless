import { assertEquals, assertStringIncludes } from '@std/assert';
import { stub, spy } from '@std/testing/mock';
import { initCurless } from '../../src/commands/init_command.ts';

Deno.test('initCurless - creates config file when none exists', async () => {
  using _statStub = stub(Deno, 'stat', () => {
    throw new Deno.errors.NotFound('File not found');
  });
  let writtenContent = '';
  using writeStub = stub(
    Deno,
    'writeTextFile', // deno-lint-ignore no-explicit-any
    (...args: any[]) => {
      writtenContent = args[1] as string;
      return Promise.resolve();
    },
  );
  using consoleSpy = spy(console, 'log');

  await initCurless(false);
  assertEquals(writeStub.calls.length, 1);
  assertEquals(writtenContent.length > 0, true);
  assertStringIncludes(consoleSpy.calls[0].args[0], 'Successfully created');
});

Deno.test(
  'initCurless - does not overwrite when file exists and overwrite is false',
  async () => {
    using _statStub = stub(Deno, 'stat', () =>
      Promise.resolve({} as Deno.FileInfo),
    );
    using writeStub = stub(Deno, 'writeTextFile', () => Promise.resolve());
    using consoleSpy = spy(console, 'log');

    await initCurless(false);
    assertEquals(writeStub.calls.length, 0);
    assertStringIncludes(consoleSpy.calls[0].args[0], 'already exists');
  },
);

Deno.test('initCurless - overwrites when overwrite is true', async () => {
  let writtenContent = '';
  using writeStub = stub(
    Deno,
    'writeTextFile', // deno-lint-ignore no-explicit-any
    (...args: any[]) => {
      writtenContent = args[1] as string;
      return Promise.resolve();
    },
  );
  using consoleSpy = spy(console, 'log');

  await initCurless(true);
  assertEquals(writeStub.calls.length, 1);
  assertEquals(writtenContent.length > 0, true);
  assertStringIncludes(consoleSpy.calls[0].args[0], 'Successfully created');
});
