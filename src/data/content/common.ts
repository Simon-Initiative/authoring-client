import createGuid from '../../utils/guid';
import { getKey } from 'data/common.ts';
import { ResourceId } from 'data/types';

export function getChildren(item): Object[] {

  if (item['#array'] !== undefined) {
    return item['#array'];
  }
  return [item];
}

export function except(array, ...elements): Object[] {
  return array.filter(x => elements.indexOf(getKey(x)) === -1);
}


// Create a random guid/id for the content type. We always want to create a guid if empty,
// but only want to create an id if it's initialized as an empty string.
export function augment(params, hasId = false) {
  const guid = createGuid();

  if (params === undefined) {
    return {
      guid,
      id: guid,
    };
  }
  if (!params.guid) {
    Object.assign(params, { guid });
  }
  if (params.id === '' || (hasId && !params.id)) {
    Object.assign(params, { id: guid });
  }

  return params;
}

export function setId(model, json, notify?: () => void) {
  if (json['@id']) {
    const id = json['@id'];
    return model.with({
      id: model.id instanceof ResourceId ? ResourceId.of(id) : id,
    });
  }
  if (notify) {
    notify();
  }
  return model.with({
    id: model.id instanceof ResourceId ? ResourceId.of(createGuid()) : createGuid(),
  });
}

export function ensureIdGuidPresent<T>(record: Record<string, any>): T {
  const id = record.id ? { id: createGuid() } : {};
  const guid = record.guid ? { guid: createGuid() } : {};

  return record.merge({
    ...guid,
    ...id,
  }) as T;
}


export function defaultIdGuid(params) {

  const id = createGuid();

  const defaults = {
    id,
    guid: id,
  };

  return Object.assign({}, defaults, params);
}

