import { ResourceRef } from './resourceref';
import { Item } from './item';
import guid from '../../../utils/guid';
import { ResourceId } from 'data/types';

export const PLACEHOLDER_ITEM_ID = 'placeholderitemid';

const PLACEHOLDER_RESOURCE_REF = new ResourceRef()
  .with({ idref: ResourceId.of(PLACEHOLDER_ITEM_ID) });

const PLACEHOLDER_ITEM = new Item().with({ resourceref: PLACEHOLDER_RESOURCE_REF });

export function createPlaceholderItem(): Item {
  return PLACEHOLDER_ITEM.with({ id: guid() });
}
