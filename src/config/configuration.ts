import { readFileSync, existsSync } from 'fs';
import * as yaml from 'js-yaml';
import { join } from 'path';

export default () => {
  const env = process.env.NODE_ENV;
  let configFile = `config-${env}.yaml`;
  if (!existsSync(configFile)) {
    configFile = 'config.yaml';
  }

  const path = join(__dirname, configFile);
  return yaml.load(readFileSync(path, 'utf8')) as Record<string, any>;
};
