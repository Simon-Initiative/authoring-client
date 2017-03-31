import * as Immutable from 'immutable';

import { ContentState, ContentBlock, EntityMap, convertToRaw, convertFromRaw} from 'draft-js';
import { HtmlContent } from '../../../../../data/contentTypes';
import * as types from './common';
import { BlockTypes } from '../blocktypes';

// Translation routines to convert from persistence model to draft model 

export function htmlContentToDraft(htmlContent: HtmlContent) : ContentState {
  // Current support is a simple identity transform 

  const keyHandlers = {
    section: sectionHandler,
    body: genericContainerHandler,
    p: paragraphHandler,
    ol: listHandler.bind(undefined, 'ordered-list-item'),
    ul: listHandler.bind(undefined, 'unordered-list-item')
  }

  const params : types.RawDraft = {
    entityMap : {},
    blocks : []
  };
    
  genericContainerHandler(htmlContent.body, keyHandlers, params, 0);

  console.log(params.blocks);

  return convertFromRaw(params);
}



function getBlockStyleForDepth(depth: number) : string {
  if (types.sectionBlockStyles[depth] === undefined) {
    return 'header-six';
  } else {
    return types.sectionBlockStyles[depth];
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

function addNewBlock(params : types.RawDraft, values : Object) {
  const defaultBlock : types.RawContentBlock = {
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


function listHandler(listBlockType, item, keyRegistry, params : types.RawDraft, depth: number) {
  item.forEach(listItem => {
    addNewBlock(params, { 
      text: listItem.li.text,
      type: listBlockType,
      data: { oliDepth: depth}
    });
  });
}

function paragraphHandler(item, keyRegistry, params : types.RawDraft, depth: number) {
  if (item instanceof Array) {

    let fullText = '';
    let markups : types.RawInlineStyle[] = [];
    item.forEach(subItem => {
      switch (getKey(subItem)) {
        case 'em': 
          markups.push({ offset: fullText.length, length: subItem.em.text.length, style: 'ITALIC'});
          fullText += subItem.em.text;
          break;
        case 'text':
          fullText += subItem.text; 
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
      text: item.text,
      data: { oliDepth: depth }
    });
  }
}


function sectionHandler(item, keyRegistry, params : types.RawDraft, depth: number) {

   // Create a content block displaying the title text
  const values = { 
    type: getBlockStyleForDepth(depth + 1), 
    text: item[0].title.text,
    data: { oliType: 'section.title', oliDepth: depth + 1}
  };
  addNewBlock(params, values);

  // parse the body 
  keyRegistry.body(item[1].body, keyRegistry, params, depth + 1);
}

function genericContainerHandler(container, keyHandlers, params: types.RawDraft, depth: number) {
  container.forEach(item => {
    parse(item, keyHandlers, params, depth);
  });
}

function handleUnsupported(item, keyRegistry, params : types.RawDraft, depth: number) {
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

function parse(item, keyHandlers, params : types.RawDraft, depth: number) {

  // item is an object with one key.  That key will be either 'section' or 'title'
  // or 'body' or 'p' or ...  

  const key = getKey(item);
  const handler = keyHandlers[key];

  if (handler === undefined) {
    handleUnsupported(item, keyHandlers, params, depth);
  } else {
    handler(item[key], keyHandlers, params, depth);
  }

}
