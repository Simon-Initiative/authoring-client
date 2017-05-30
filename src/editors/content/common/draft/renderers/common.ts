import { shouldInsertBlock } from '../commands/common';

export function handleInsertion(props : any) {
  if (shouldInsertBlock(props.contentState, props.block.key)) {
    props.blockProps.onInsertBlock(props.block.key);
  }
}
