import * as Immutable from 'immutable';

import { ContentState, ContentBlock, EntityMap, convertToRaw, convertFromRaw} from 'draft-js';
import { HtmlContent } from '../../../../../data/contentTypes';
import * as common from './common';
import { BlockTypes } from '../blocktypes';

// Translation routines to convert from persistence model to draft model 


export function htmlContentToDraft(htmlContent: HtmlContent) : ContentState {
  
  const keyHandlers = {
    section: sectionHandler,
    body: bodyHandler,
    p: paragraphHandler,
    ol: listHandler.bind(undefined, 'ordered-list-item'),
    ul: listHandler.bind(undefined, 'unordered-list-item')
  }

  const params : common.RawDraft = {
    entityMap : {},
    blocks : []
  };
  
  parse(htmlContent, keyHandlers, params, 0);
  
  console.log(params.blocks);

  return convertFromRaw(params);
}



function getBlockStyleForDepth(depth: number) : string {
  if (common.sectionBlockStyles[depth] === undefined) {
    return 'header-six';
  } else {
    return common.sectionBlockStyles[depth];
  }
}

// This is the same code that Draft.js uses to determine
// random block keys:
const seenKeys = {};
const MULTIPLIER = Math.pow(2, 24);

function generateRandomKey(): string {
  let key;
  while (key === undefined || seenKeys.hasOwnProperty(key) || !isNaN(+key)) {
    key = Math.floor(Math.random() * MULTIPLIER).toString(32);
  }
  seenKeys[key] = true;
  return key;
}


function getKey(item) {
  return Object.keys(item)[0];
}

function addNewBlock(params : common.RawDraft, values : Object) {
  const defaultBlock : common.RawContentBlock = {
    key: generateRandomKey(),
    text: ' ',
    type: 'unstyled',
    depth: 0,
    inlineStyleRanges: [],
    entityRanges: [],
    data: {}
  }
  const block = Object.assign({}, defaultBlock, values);
  params.blocks.push(block);
}


function listHandler(listBlockType, item, keyRegistry, params : common.RawDraft, depth: number) {
  const key = getKey(item);
  item[key][common.ARRAY].forEach(listItem => {
    addNewBlock(params, { 
      text: listItem.li[common.TEXT],
      type: listBlockType,
      data: { oliDepth: depth}
    });
  });
}

function paragraphHandler(item, keyRegistry, params : common.RawDraft, depth: number) {
  
  const key = getKey(item);
  if (item[key][common.ARRAY] !== undefined) {

    let fullText = '';
    let markups : common.RawInlineStyle[] = [];
    item[key][common.ARRAY].forEach(subItem => {
      switch (getKey(subItem)) {
        case 'foreign': // intentional fall through
        case 'ipa':  // intentional fall through
        case 'sym':  // intentional fall through
        case 'cite': // intentional fall through
        case 'term': // intentional fall through 
        case 'var':  // intentional fall through
        case 'sub':  // intentional fall through
        case 'sup':
          const key = getKey(subItem);
          const subStyle = common.styleMap[key];
          markups.push({ offset: fullText.length, length: subItem[key][common.TEXT].length, style: subStyle});
          fullText += subItem[key][common.TEXT];
          break;
        case 'em': 
          const style = common.styleMap[subItem.em[common.STYLE]];
          markups.push({ offset: fullText.length, length: subItem.em[common.TEXT].length, style});
          fullText += subItem.em[common.TEXT];
          break;
        case common.TEXT:
          fullText += subItem[common.TEXT]; 
          break;
        case common.CDATA:
          fullText += subItem[common.CDATA]; 
          break;
      }
    });

    addNewBlock(params, { 
      text: fullText,
      inlineStyleRanges: markups,
      data: { oliDepth: depth }
    });

  } else {
    // It is just one text element, go ahead and create a block for it
    addNewBlock(params, { 
      text: item[key][common.TEXT],
      data: { oliDepth: depth }
    });
  }
}


function sectionHandler(item, keyRegistry, params : common.RawDraft, depth: number) {

  const key = getKey(item);

   // Create a content block displaying the title text
  const values = { 
    type: getBlockStyleForDepth(depth + 1), 
    text: item[key][common.ARRAY][0].title[common.TEXT],
    data: { oliType: 'section.title', oliDepth: depth + 1}
  };
  addNewBlock(params, values);

  // parse the body 
  parse(item[key][common.ARRAY][1], keyRegistry, params, depth + 1);
}

function bodyHandler(item, keyRegistry, params : common.RawDraft, depth: number) {

  const key = getKey(item);
  item[key][common.ARRAY].forEach(subItem => parse(subItem, keyRegistry, params, depth));
}

function handleUnsupported(item, keyRegistry, params : common.RawDraft, depth: number) {
  // Add a new block with an immutable entity containing the raw data 
  const entityKey = generateRandomKey();
  const values = { 
    type: 'atomic', 
    text: ' ',
    entityRanges: [{offset: 0, length: 1, key: entityKey}],
  };
  addNewBlock(params, values);
  params.entityMap[entityKey] = {
    type: BlockTypes.unsupported,
    mutability: 'IMMUTABLE',
    data: { src: JSON.stringify(item) }
  };
}

function parse(item : Object, keyHandlers, params : common.RawDraft, depth: number) {

  // item is an object with one key.  That key will be either 'section' or 'title'
  // or 'body' or 'p' or ...  

  // Get the key and then get the registered key handler
  const key = getKey(item);
  const handler = keyHandlers[key];

  if (handler === undefined) {
    handleUnsupported(item, keyHandlers, params, depth);
  } else {
    handler(item, keyHandlers, params, depth);
  }

}
