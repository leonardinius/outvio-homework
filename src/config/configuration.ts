import { readFileSync, existsSync } from 'fs';
import * as yaml from 'js-yaml';
import { join } from 'path';

export default () => {
  const env = process.env.NODE_ENV;
  let path = join(__dirname, `config-${env}.yaml`);
  if (!existsSync(path)) {
    path = join(__dirname, 'config.yaml');
  }

  return yaml.load(readFileSync(path, 'utf8')) as Record<string, any>;
};
