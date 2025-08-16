import { stringify } from 'jsr:@std/yaml/stringify';
import { printMessage } from '../output/response_formatter.ts';
import { Config } from '../utils/types.ts';

const config: Config = {
  environments: {
    dev: {
      baseUrl: 'https://jsonplaceholder.typicode.com',
    },
  },
  secrets: {
    envFile: '.env',
  },
  requests: {
    getAllPosts: {
      method: 'GET',
      path: '/posts',
    },
    getPostById: {
      method: 'GET',
      path: '/posts/{postId}',
      headers: {
        Authorization: 'Bearer ${API_KEY}',
        'X-Custom-Header': '${CUSTOM_HEADER_VALUE}',
      },
    },
    getPostByIdTwo: {
      method: 'GET',
      path: '/posts/1',
    },
    createPost: {
      method: 'POST',
      path: '/posts',
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        apikey: '${API_KEY}',
      },
    },
    updatePost: {
      method: 'PUT',
      path: '/posts/{postId}',
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
      },
    },
  },
  data_templates: {
    new_post_payload: {
      title: 'foo',
      body: 'bar',
      userId: 1,
    },
    updated_post_payload: {
      id: 1,
      title: 'foo updated',
      body: 'bar updated',
      userId: 1,
    },
  },
};

/**
 * Function creates the intial curless.yaml config file with some placeholder values.
 * If the -f or --force flag is used, the existing config is overwritten.
 * @param overwrite
 */
export async function initCurless(overwrite: boolean): Promise<void> {
  const filePath = 'curless.yaml';

  if (overwrite === false) {
    try {
      await Deno.stat(filePath);
      printMessage(
        'error',
        `Error: File "${filePath}" already exists. Run curless init -f to replace the existing config.`,
      );
      return;
    } catch (error) {
      // if the error is other than "not found", throw it. Otherwise we can proceed.
      if (!(error instanceof Deno.errors.NotFound)) {
        throw error;
      }
    }
  }

  const yaml = stringify(config);
  await Deno.writeTextFile(filePath, yaml);
  printMessage('success', 'Successfully created configuration file');
}
