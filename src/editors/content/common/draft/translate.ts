
import { ContentState, convertToRaw, convertFromRaw} from 'draft-js';
import { HtmlContent } from '../../../../data/contentTypes';

// Translation routines between the models:

// 1. The nextgen course content model for HTML text. 

// 2. The Draft.js content model. This is the model that powers the 
//    Draft editor. Referred to here as the 'draft' model.


export function htmlContentToDraft(htmlContent: HtmlContent) : ContentState {
  // Current support is a simple identity transform 
  return convertFromRaw(htmlContent);
}

export function draftToHtmlContent(state: ContentState) : HtmlContent {
  // Current support is a simple identity transform
  const rawContent = convertToRaw(state);
  const mixinContentTag = Object.assign({}, rawContent, { contentType: 'HtmlContent'});
  return new HtmlContent(mixinContentTag);
}