import * as Immutable from 'immutable';
import { ContentBlock, ContentState, 
  EditorState, Modifier } from 'draft-js';


// Routines for validating paste operations


// Schema constraints.  The property can only contain the
// types in the value array
const schema = {
  title: [],
  section: ['title', 'pullout', 'example', 'definition'],
  pullout: ['title'],
  example: ['title'],
  definition: ['title', 'meaning', 'translation', 'pronunciation'],
  meaning: ['material', 'example'],
  translation: [],
  pronunciation: [],
  material: [],
};

export function wouldViolateSchema(
  fragment: Immutable.OrderedMap<string, ContentBlock>,
  editorState: EditorState) : boolean {

  // Simulate the paste operation
  const wouldBeState = Modifier.replaceWithFragment(
    editorState.getCurrentContent(), editorState.getSelection(), fragment);

  // And now validate the state that we would be in if
  // we let the paste operation complete 
  return !validateSchema(wouldBeState);

}

function prefix(type: string) : string {
  return type.substr(0, type.indexOf('_'));
}

function satisifiesConstraints(parent: string, child: string) : boolean {

  if (schema[parent] !== undefined) {
    return schema[parent].find(e => e === child) !== undefined;

  } else {
    console.log('WARNING: encountered unexpected sentinel type: ' + parent);
  }

}

// Determines if the fragment contains sentinel blocks
// whose begin and end blocks are balanced... aka
// there is a begin and an end, and they are properly
// nested.
export function validateSchema(wouldBeState: ContentState) : boolean {

  // Walk through the blocks, pushing and popping 
  // sentinel blocks on a stack to determine if they 
  // are balanced.

  const stack = [];
  const blocks = wouldBeState.getBlocksAsArray();

  for (let i = 0; i < blocks.length; i += 1) {
    const contentBlock = blocks[i];

    if (contentBlock.type === 'atomic') {
      const entity = wouldBeState.getEntity(contentBlock.getEntityAt(0));
      const type : string = entity.type;

      if (type.endsWith('_begin')) {

        // Before pushing, make sure no constraint is vioated
        if (stack.length > 0) {
          const top = stack[stack.length - 1];

          if (!satisifiesConstraints(prefix(top), prefix(type))) {
            return false;
          }
        }

        stack.push(type);

      } else if (type.endsWith('_end')) {
        
        // A paste was made with an end that is missing 
        // its begin
        if (stack.length === 0) {
          return false;
        }

        const element = stack.pop();
        const matchingBegin = type.replace('_end', '_begin');

        // See if the top of the stack has a matching
        // begin element 
        if (element !== matchingBegin) {
          return false;
        }
      }
    }
  }

  // If the stack is not empty, we have a missing end sentinel
  return stack.length === 0; 
}
