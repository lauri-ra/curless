import { parseArgs } from "@std/cli/parse-args";
import { ParsedCommands } from "./types.ts";

export function parseCliArgs(args: string[]): ParsedCommands {
  const parsed = parseArgs(args, {
    boolean: ["version", "help", "force", "verbose"],
    string: [
      "auth",
      "data",
      "env",
      "header",
      "H",
      "config",
      "migrate",
      "baseUrl",
      "timeout",
    ],
    alias: {
      h: "help",
      V: "version",
      H: "header",
      d: "data",
      a: "auth",
      e: "env",
      c: "config",
      f: "force",
      v: "verbose",
      t: "timeout",
    },
    collect: ["header", "H"],
    stopEarly: false,
  });

  return parsed as ParsedCommands;
}
