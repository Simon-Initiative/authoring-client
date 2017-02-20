const protocol = 'http://';
const hostname = 'localhost';
const port = '5984';
const baseUrl = protocol + hostname + ':' + port;
const database = 'editor';

export type Configuration = {
  protocol: string,
  baseUrl: string,
  hostname: string,
  port: string,
  database: string
}

export const configuration : Configuration = {
  protocol,
  baseUrl,
  hostname,
  port,
  database
};