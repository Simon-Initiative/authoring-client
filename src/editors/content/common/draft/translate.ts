import * as Immutable from 'immutable';

import { ContentState, ContentBlock, EntityMap, convertToRaw, convertFromRaw} from 'draft-js';
import { HtmlContent } from '../../../../data/contentTypes';

// Translation routines between the models:

// 1. The nextgen course content model for HTML text. 

// 2. The Draft.js content model. This is the model that powers the 
//    Draft editor. Referred to here as the 'draft' model.

const sectionBlockStyles = {
  1: 'header-two',
  2: 'header-three',
  3: 'header-four',
  4: 'header-five',
  5: 'header-six'
};

function getBlockStyleForDepth(depth: number) : string {
  if (sectionBlockStyles[depth] === undefined) {
    return 'header-six';
  } else {
    return sectionBlockStyles[depth];
  }
}

type RawInlineStyle = {
  offset: number,
  length: number,
  style: string 
};
type RawEntityRange = {
  offset: number,
  length: number,
  key: string
}
type RawContentBlock = {
  key: string,
  text: string,
  type: string,
  depth: number,
  inlineStyleRanges: RawInlineStyle[],
  entityRanges: RawEntityRange[],
  data: any
};

type RawEntityMap = Object;

type RawDraft = {
  entityMap : RawEntityMap,
  blocks: RawContentBlock[]
};


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

function addNewBlock(params : RawDraft, values : Object) {
  const defaultBlock : RawContentBlock = {
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

export function htmlContentToDraft(htmlContent: HtmlContent) : ContentState {
  // Current support is a simple identity transform 

  const keyHandlers = {
    section: sectionHandler,
    body: genericContainerHandler,
    p: paragraphHandler
  }

  const params : RawDraft = {
    entityMap : {},
    blocks : []
  };
    
  genericContainerHandler(htmlContent.body, keyHandlers, params, 0);

  console.log(params.blocks);

  return convertFromRaw(params);
}

function paragraphHandler(item, keyRegistry, params : RawDraft, depth: number) {
  if (item instanceof Array) {

    let fullText = '';
    let markups : RawInlineStyle[] = [];
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
      inlineStyleRanges: markups
    });

  } else {
    // It is just one text element, go ahead and create a block for it
    addNewBlock(params, { 
      text: item.text
    });
  }
}


function sectionHandler(item, keyRegistry, params : RawDraft, depth: number) {

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

function genericContainerHandler(container, keyHandlers, params: RawDraft, depth: number) {
  container.forEach(item => {
    parse(item, keyHandlers, params, depth);
  });
}

function parse(item, keyHandlers, params : RawDraft, depth: number) {

  // item is an object with one key.  That key will be either 'section' or 'title'
  // or 'body' or 'p' or ...  

  const key = getKey(item);
  const handler = keyHandlers[key];

  if (handler === undefined) {
    console.log('ignoring unknown key type: ' + key);
  } else {
    handler(item[key], keyHandlers, params, depth);
  }

}


export function draftToHtmlContent(state: ContentState) : HtmlContent {
  // Current support is a simple identity transform
  const rawContent = convertToRaw(state);
  const mixinContentTag = Object.assign({}, rawContent, { contentType: 'HtmlContent'});
  return new HtmlContent(mixinContentTag);
}