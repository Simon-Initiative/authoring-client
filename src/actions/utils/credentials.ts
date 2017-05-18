
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
    'Content-Type': 'multipart/form-data',
    Accept: 'application/json',
    Authorization: 'Bearer ' + credentials.token,
  };
}
