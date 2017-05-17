import { getKey } from '../common';
import createGuid from '../../utils/guid';

export function getChildren(item) : Array<Object> {

  if (item['#array'] !== undefined) {
    return item['#array'];
  }
  return [item];
}

export function augment(params) {
  if (params === undefined) {
    return { guid: createGuid()};
  } else if (params.guid === undefined) {
    return Object.assign({}, params, {guid: createGuid()});
  } else {
    return params;
  }
}
