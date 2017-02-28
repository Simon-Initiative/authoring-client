const protocol = 'http://';
const hostname = 'localhost';
const port = '8888';
const prefix = 'api';
const baseUrl = protocol + hostname + ':' + port + '/' + prefix;
const database = 'editor';

export type Configuration = {
  protocol: string,
  baseUrl: string,
  hostname: string,
  port: string,
  database: string,
  prefix: string
}

export const configuration : Configuration = {
  protocol,
  baseUrl,
  hostname,
  port,
  database,
  prefix
};