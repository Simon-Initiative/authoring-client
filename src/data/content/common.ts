import createGuid from '../../utils/guid';
import { getKey } from 'data/common.ts';

export function getChildren(item) : Object[] {

  if (item['#array'] !== undefined) {
    return item['#array'];
  }
  return [item];
}

export function except(array, ...elements): Object[] {
  return array.filter(x => elements.indexOf(getKey(x)) === -1);
}

export function augment(params) {
  if (params === undefined) {
    return { guid: createGuid() };
  }
  if (params.guid === undefined) {
    return Object.assign({}, params, { guid: createGuid() });
  }

  return params;
}


export function defaultIdGuid(params) {

  const id = createGuid();

  const defaults = {
    id,
    guid: id,
  };

  return Object.assign({}, defaults, params);
}

