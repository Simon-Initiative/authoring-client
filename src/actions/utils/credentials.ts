
type Credentials = {
  token: string,
};

export const credentials : Credentials = {
  token: null,
};

export function getHeaders(credentials: Credentials) {
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: 'Bearer ' + credentials.token,
  };
}

export function getFormHeaders(credentials: Credentials) {
  return {
    Authorization: 'Bearer ' + credentials.token,
  };
}
