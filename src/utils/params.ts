
function getQueryVariable(variable: string) : string {
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) == variable) {
            return decodeURIComponent(pair[1]);
        }
    }
    return null;
}

export function getUserName() : string {
  let value = getQueryVariable('user');
  return value === null ? 'user1' : value;
}
