import { createHashHistory } from 'history';

export default createHashHistory({
  hashType: 'noslash', // Omit the leading slash
});
