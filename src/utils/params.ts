// Extracting information from query parameter strings


export function getQueryVariable(variable: string) : string {
  const query = window.location.search.substring(1);
  return getQueryVariableFromString(variable, query);
}


export function getQueryVariableFromString(variable: string, str: string) : string {
  const vars = str.split('&');
  for (let i = 0; i < vars.length; i += 1) {
    const pair = vars[i].split('=');
    if (decodeURIComponent(pair[0]) === variable) {
      return decodeURIComponent(pair[1]);
    }
  }
  return null;
}


export function getUserName() : string {
  const value = getQueryVariable('user');
  return value === null ? 'user1' : value;
}
