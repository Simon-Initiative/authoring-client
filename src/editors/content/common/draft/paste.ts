import * as Immutable from 'immutable';
import { ContentBlock, ContentState } from 'draft-js';


// Routines for handling paste operations


// Determines if the fragment contains sentinel blocks
// whose begin and end blocks are balanced... aka
// there is a begin and an end, and they are properly
// nested.
export function hasBalancedSentinels(
  fragment: Immutable.OrderedMap<string, ContentBlock>,
  contentState: ContentState,
  ) {

  // Walk through the blocks, pushing and popping 
  // sentinel blocks on a stack to determine if they 
  // are balanced.

  const stack = [];
  const arr = fragment.toArray();

  for (let i = 0; i < arr.length; i += 1) {
    const contentBlock = arr[i];

    if (contentBlock.type === 'atomic') {
      const entity = contentState.getEntity(contentBlock.getEntityAt(0));
      const type : string = entity.type;

      if (type.endsWith('_begin')) {
        stack.push(type);
      } else if (type.endsWith('_end')) {
        
        // A paste was made with an end that is missing 
        // its begin
        if (stack.length === 0) {
          return false;
        }

        const element = stack.pop();
        const matchingBegin = type.replace('_end', '_begin');

        if (element !== matchingBegin) {
          return false;
        }
      }
    }
  }
  
  return stack.length === 0; 
}
