import * as colors from '@std/fmt/colors';
import { loadConfig } from '../config/loader.ts';
import { printMessage } from '../output/response_formatter.ts';

export async function listRequests(configPath?: string): Promise<void> {
  const config = await loadConfig(configPath);

  if (!config) {
    return;
  }

  if (!config.requests || Object.keys(config.requests).length === 0) {
    printMessage('error', 'No requests defined in configuration.');
    return;
  }

  console.log('');
  console.log(colors.bold('  Requests'));
  console.log(colors.dim('  --------'));

  for (const [name, request] of Object.entries(config.requests)) {
    const method = request.method.toUpperCase().padEnd(7);
    console.log(
      `  ${colors.cyan(method)} ${colors.bold(name)} ${colors.dim(request.path)}`,
    );
  }

  console.log('');
}
