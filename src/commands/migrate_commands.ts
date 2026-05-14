import { stringify } from "@std/yaml/stringify";
import { Config, ParsedCommands } from "../utils/types.ts";
import { printMessage } from "../output/response_formatter.ts";

interface PostmanHeader {
  key: string;
  value: string;
}

interface PostmanQuery {
  key: string;
  value: string;
  disabled?: boolean;
}

interface PostmanUrl {
  protocol?: string;
  host?: string[];
  path?: string[];
  query?: PostmanQuery[];
}

interface PostmanRequest {
  method: string;
  header: PostmanHeader[];
  url: PostmanUrl;
}

interface PostmanItem {
  name: string;
  request: PostmanRequest;
}

interface PostmanCollection {
  item: PostmanItem[];
}

// WORK IN PROGRESS — experimental Postman collection importer.
// Supports flat collections; nested folders, variables, auth, and request
// bodies are not yet handled. Tracked under post-1.0 in ROADMAP.md.
export async function migratePostman(commands: ParsedCommands) {
  const file = await Deno.readTextFile(commands.migrate as string);
  const postmanData = JSON.parse(file) as PostmanCollection;
  const postmanFile = "curless.postman.yaml";

  let baseUrl = "";
  if (postmanData.item?.length > 0) {
    const firstUrl = postmanData.item[0].request.url;
    if (firstUrl?.protocol && firstUrl.host) {
      baseUrl = `${firstUrl.protocol}://${firstUrl.host.join(".")}`;
    }
  }
  if (commands.baseUrl) {
    baseUrl = commands.baseUrl;
  }

  const config: Config = {
    environments: { dev: { baseUrl, default: true } },
    secrets: { envFile: "" },
    requests: {},
    data_templates: {},
  };

  for (const item of postmanData.item) {
    const requestName = item.name.split(" ").join("_");
    const method = item.request.method;
    const headers = item.request.header.reduce<Record<string, string>>(
      (acc, h) => {
        acc[h.key] = h.value;
        return acc;
      },
      {},
    );
    const path = (item.request.url.path ?? []).join("/");

    const queryParts: string[] = [];
    if (item.request.url.query) {
      for (const q of item.request.url.query) {
        if (!q.disabled) {
          queryParts.push(`${q.key}=${q.value}`);
        }
      }
    }

    const fullPath = queryParts.length > 0
      ? `/${path}?${queryParts.join("&")}`
      : `/${path}`;

    if (!config.requests) {
      config.requests = {};
    }

    config.requests[requestName] = {
      method,
      headers,
      path: fullPath,
    };
  }
  const yaml = stringify(config);
  await Deno.writeTextFile(postmanFile, yaml);
  printMessage(
    "success",
    "Successfully created config from Postman collection",
  );
}
