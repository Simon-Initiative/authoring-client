import { getKey } from '../common';

export function getChildren(item) : Array<Object> {

  if (item['#array'] !== undefined) {
    return item['#array'];
  }
  return [item];
}