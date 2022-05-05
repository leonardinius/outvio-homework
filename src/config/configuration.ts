import { readFileSync } from 'fs';
import * as yaml from 'js-yaml';
import { join } from 'path';

export default () => {
  const env = process.env.NODE_ENV;

  let configFile: string;
  switch (env) {
    case 'production':
      configFile = 'config.yaml';
      break;
    default:
      configFile = `config-${env}.yaml`;
      break;
  }

  const path = join(__dirname, configFile);
  return yaml.load(readFileSync(path, 'utf8')) as Record<string, any>;
};
