
import { ContentState, convertToRaw, convertFromRaw} from 'draft-js';

// Translation routines between the models:

// 1. The nextgen course content model.  This is the model persisted
//    in the backend. Referred to here as the 'content' model
// 2. The Draft.js content model. This is the model that powers the 
//    Draft editor. Referred to here as the 'draft' model.


export function translateContentToDraft(content: Object) : ContentState {
  // Current support is a simple identity transform 
  return convertFromRaw(content);
}

export function translateDraftToContent(state: ContentState) : Object {
  // Current support is a simple identity transform
  return convertToRaw(state);
}