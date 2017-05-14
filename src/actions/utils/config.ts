const protocol = 'http://';
const hostname = 'raffmac.local';
const prefix = 'content-service/api/v1';
const baseUrl = protocol + hostname + '/' + prefix;

// These will go away during content-service transition
//const database = 'editor';
const database = 'packages';
const attachmentDatabase = 'attachments';

export type Configuration = {
  protocol: string,
  baseUrl: string,
  hostname: string,
  database: string,
  attachmentDatabase: string,
  prefix: string
}

export const configuration : Configuration = {
  protocol,
  baseUrl,
  hostname,
  database,
  attachmentDatabase,
  prefix
};

export function relativeToAbsolute(relativeURL: string, database: string) : string {
  return configuration.baseUrl + '/' + database + '/' + relativeURL;
}