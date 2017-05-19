const protocol = 'http://';
const hostname = 'dev.local';
const prefix = 'content-service/api/v1';
const baseUrl = protocol + hostname + '/' + prefix;

// These will go away during content-service transition
const database = 'packages';
const attachmentDatabase = 'attachments';

export type Configuration = {
  protocol: string,
  baseUrl: string,
  hostname: string,
  database: string,
  attachmentDatabase: string,
  prefix: string,
  webContentUrlBase: string,
};

export const configuration : Configuration = {
  protocol,
  baseUrl,
  hostname,
  database,
  attachmentDatabase,
  prefix,
  webContentUrlBase: protocol + hostname + '/content-service',
};

export function relativeToAbsolute(relativeURL: string, database: string) : string {
  return configuration.baseUrl + '/' + database + '/' + relativeURL;
}
