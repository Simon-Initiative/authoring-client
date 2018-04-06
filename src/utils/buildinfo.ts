const packageJson  = require('!../../package.json');

export const getVersion = () => {
  return packageJson.version;
};
