
const createHistory = require('history').createHashHistory;

export default createHistory({
  hashType: 'noslash', // Omit the leading slash
});
