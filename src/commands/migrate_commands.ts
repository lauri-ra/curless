import { stringify } from 'jsr:@std/yaml/stringify';
import { Config } from '../utils/types.ts';
import { printMessage } from '../output/response_formatter.ts';

// WORK IN PROGRESS
// TODO:
// - parse request body
// - handle edge cases
export async function migratePostman(filePath: string) {
  const file = await Deno.readTextFile(filePath);
  const postmanData = JSON.parse(file);
  const postmanFile = 'curless.postman.yaml';

  // console.dir(postmanData, { colors: true, depth: null });

  let baseUrl = '';
  if (postmanData.item?.length > 0) {
    const firstUrl = postmanData.item[0].request.url;
    if (firstUrl && firstUrl.protocol && firstUrl.host) {
      baseUrl = `${firstUrl.protocol}://${firstUrl.host.join('.')}`;
    }
  }

  const config: Config = {
    environments: { dev: { baseUrl } },
    secrets: { envFile: '' },
    requests: {},
    data_templates: {},
  };

  for (const item of postmanData.item) {
    const requestName = item.name.split(' ').join('_');
    const method = item.request.method;
    const headers = item.request.header.reduce(
      (acc: { [x: string]: any }, h: { key: string | number; value: any }) => {
        acc[h.key] = h.value;
        return acc;
      },
      {},
    );
    const path = item.request.url.path.join('/');

    const queryParams = new URLSearchParams();
    if (item.request.url.query) {
      for (const query of item.request.url.query) {
        queryParams.append(query.key, query.value);
      }
    }

    const fullPath = queryParams.toString()
      ? `/${path}?${queryParams.toString()}`
      : `/${path}`;

    console.log(fullPath);

    if (!config.requests) {
      config.requests = {};
    }

    config.requests[requestName] = {
      method,
      headers,
      path: fullPath,
    };

    console.log(config.requests[requestName]);
  }
  const yaml = stringify(config);
  await Deno.writeTextFile(postmanFile, yaml);
  printMessage(
    'success',
    'Successfully created config from Postman collection',
  );
}
