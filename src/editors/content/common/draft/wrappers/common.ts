import { EntityTypes } from '../../../../../data/content/html/common';
import { ContentBlock, ContentState } from 'draft-js';

export type BlockIdentifier = (block: ContentBlock, content: ContentState) => boolean;

export type ContentWrapper = {
  component : any,
  isBeginBlock: BlockIdentifier,
  isEndBlock: BlockIdentifier,
};

export function isEntityType(type: EntityTypes, block: ContentBlock, content: ContentState) {

  if (block.type === 'atomic') {
    const key = block.getEntityAt(0);
    const entity = content.getEntity(key);
    return entity.type === type;

  }

  return false;
}
