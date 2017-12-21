import { ContentState, ContentBlock } from 'draft-js';

export type Decorator = {
  component : any,
  strategy : (contentBlock : ContentBlock, callback: any, contentState : ContentState) => void,
  props: Object,
};

export function byType(type, contentBlock, callback, contentState) {
  contentBlock.findEntityRanges(
    (character) => {
      const entityKey = character.getEntity();
      return (
        entityKey !== null &&
        contentState.getEntity(entityKey).getType() === type
      );
    },
    callback,
  );
}
