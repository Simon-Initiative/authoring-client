import { ResourceRef } from './resourceref';
import { Item } from './item';

export const PLACEHOLDER_ITEM_ID = 'placeholderitemid';

const PLACEHOLDER_RESOURCE_REF = new ResourceRef()
  .with({ idref: PLACEHOLDER_ITEM_ID });

export const PLACEHOLDER_ITEM = new Item().with({ resourceref: PLACEHOLDER_RESOURCE_REF });
