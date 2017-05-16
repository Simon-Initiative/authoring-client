
type Credentials = {
  user: string,
  password: string,
};

export const credentials : Credentials = {
  user: null,
  password: null,
};

export function getHeaders(credentials: Credentials) {
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: 'Basic ' + btoa(credentials.user + ':' + credentials.password),
  };
}
