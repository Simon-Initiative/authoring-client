import * as contentTypes from '../../../data/contentTypes';

const MAX_LENGTH = 50;

export function getHtmlDetails(html : contentTypes.Html) : string {

  let block = html.contentState.getBlocksAsArray()
    .find(b => b.getType !== 'atomic' && b.getText() !== ' ')
    
  if (block === undefined) {
    return '';
  } else {
    return maxLength(block.getText(), MAX_LENGTH);
  }

}

function maxLength(text: string, length: number) : string {
  if (text.length <= length) {
    return text;
  } else {
    return text.substr(0, length - 3) + '...';
  }
  
}