import * as Immutable from 'immutable';

import { ContentState, ContentBlock, EntityMap, convertToRaw, convertFromRaw} from 'draft-js';
import { HtmlContent } from '../../../../../data/contentTypes';
import * as common from './common';
import { EntityTypes } from '../custom';

// Translation routines to convert from persistence model to draft model 

type SemanticContext = {
  beginBlock: string, 
  oliType: string,
  subType: string
}

type ParsingContext = {
  draft : common.RawDraft, 
  depth: number,
  semantic: SemanticContext
};

type WorkingBlock = {
  fullText : string,
  markups : common.RawInlineStyle[],
  entities : common.RawEntityRange[]
};

type BlockHandler = (item: Object, context: ParsingContext) => void;
type InlineHandler = (offset: number, length: number, item: Object, context: ParsingContext, workingBlock: WorkingBlock) => void;

const ol = listHandler.bind(undefined, 'ordered-list-item');
const ul = listHandler.bind(undefined, 'unordered-list-item');
const codeblock = addAtomicBlock.bind(undefined, EntityTypes.codeblock);
const table = addAtomicBlock.bind(undefined, EntityTypes.table);
const audio = addAtomicBlock.bind(undefined, EntityTypes.audio);
const video = addAtomicBlock.bind(undefined, EntityTypes.video);
const youtube = addAtomicBlock.bind(undefined, EntityTypes.youtube);


const blockHandlers = {
  pullout,
  example,
  p,
  section,
  body,
  ol,
  ul,
  codeblock,
  table,
  audio,
  video,
  youtube
};

const inlineHandlers = {
  link: insertEntity.bind(undefined, 'mutable', EntityTypes.link),
  cite: insertEntity.bind(undefined, 'mutable', EntityTypes.cite),
  em,
  foreign: applyStyle.bind(undefined, 'UNDERLINE'),
  ipa: applyStyle.bind(undefined, 'UNDERLINE'),
  sub: applyStyle.bind(undefined, 'SUBSCRIPT'),
  sup: applyStyle.bind(undefined, 'SUPERSCRIPT'),
  term: applyStyle.bind(undefined, 'BOLD'),
  var: applyStyle.bind(undefined, 'ITALIC'),
  image: insertEntity.bind(undefined, 'immutable', EntityTypes.image),
  formula: insertEntity.bind(undefined, 'immutable', EntityTypes.formula),
  quote: insertEntity.bind(undefined, 'mutable', EntityTypes.quote),
  code: insertEntity.bind(undefined, 'mutable', EntityTypes.code)
};

function applyStyle(style: string, offset: number, length: number, item: Object, 
  context: ParsingContext, workingBlock: WorkingBlock) {
  workingBlock.markups.push({ offset, length, style});
}


function em(offset: number, length: number, item: Object, 
  context: ParsingContext, workingBlock: WorkingBlock) {

  const style = common.styleMap[item[getKey(item)][common.STYLE]];
  workingBlock.markups.push({ offset, length, style});
}

function image(offset: number, length: number, item: Object, 
  context: ParsingContext, workingBlock: WorkingBlock) {

  const style = common.styleMap[item[getKey(item)][common.STYLE]];
  workingBlock.markups.push({ offset, length, style});
}


function extractAttrs(item: Object) : Object {
  const key = getKey(item);
  return Object
    .keys(item[key])
    .filter(key => key.startsWith('@'))
    .reduce((o, k) => {
      o[k] = item[key][k];
      return o;
    }, {});
}

function insertEntity(mutability: string, type: string, offset: number, length: number, item: Object, 
  context: ParsingContext, workingBlock: WorkingBlock) {

  const key = common.generateRandomKey();
  workingBlock.entities.push({ offset, length, key});
  
  const data = extractAttrs(item);
  context.draft.entityMap[key] = {
    type,
    mutability,
    data
  }
}

function getInlineHandler(key: string) : InlineHandler {
  if (inlineHandlers[key] !== undefined) {
    return inlineHandlers[key];
  } else {
    return applyStyle.bind(undefined, 'UNSUPPORTED');
  }
}


export function htmlContentToDraft(htmlContent: HtmlContent) : ContentState {
  
  const draft : common.RawDraft = {
    entityMap : {},
    blocks : []
  };
  
  parse(htmlContent, { draft, depth: 0, semantic: null});
  
  console.log(draft.blocks);

  return convertFromRaw(draft);
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

function getKey(item) {
  return Object.keys(item).filter(k => !k.startsWith('@'))[0];
}

function addNewBlock(params : common.RawDraft, values : Object) : common.RawContentBlock {
  const defaultBlock : common.RawContentBlock = {
    key: common.generateRandomKey(),
    text: ' ',
    type: 'unstyled',
    depth: 0,
    inlineStyleRanges: [],
    entityRanges: [],
    data: {}
  }
  const block : common.RawContentBlock = Object.assign({}, defaultBlock, values);
  params.blocks.push(block);

  return block;
}


function listHandler(listBlockType, item: Object, context: ParsingContext) {
  const key = getKey(item);
  item[key][common.ARRAY].forEach(listItem => {
    addNewBlock(context.draft, { 
      text: listItem.li[common.TEXT],
      type: listBlockType,
      data: { oliDepth: context.depth, semanticContext: context.semantic}
    });
  });
}


function createEntity(params: common.RawDraft, offset : number, length : number, type: string, mutability: string, data: Object) : common.RawEntityRange {

  const range : common.RawEntityRange = {
    length,
    offset,
    key: common.generateRandomKey()
  };

  params.entityMap[range.key] = {
    type,
    mutability,
    data
  }

  return range;
}

function getChildren(item: Object) : Object[] {
  const key = getKey(item);
  if (item[key][common.ARRAY] !== undefined) {
    return item[key][common.ARRAY];
  } else if (item[key][common.TEXT] !== undefined) {
    return [item[key]];
  } else if (item[key][common.CDATA] !== undefined) {
    return [item[key]];
  } else {
    return [item[key]];
  }
}

function processInline(item: Object, 
  context: ParsingContext, blockContext: WorkingBlock) {
  
  const key = getKey(item);

  if (key === common.CDATA || key === common.TEXT) {

    blockContext.fullText += item[key];

  } else {

    const children = getChildren(item);
    const offset = blockContext.fullText.length;
    
    children.forEach(subItem => {
      const subKey = getKey(subItem);
      if (subKey === common.CDATA || subKey === common.TEXT) {
        blockContext.fullText += subItem[subKey];
      } else {
        processInline(subItem, context, blockContext);
      }
    });

    const text = blockContext.fullText.substring(offset);
    const handler = getInlineHandler(key);
    handler(offset, text.length, item, context, blockContext);
  }
  
}

function p(item: Object, context: ParsingContext) {
  
  const children = getChildren(item);
  
  const blockContext = {
    fullText: '',
    markups : [],
    entities : []
  }

  children.forEach(subItem => processInline(subItem, context, blockContext));

  addNewBlock(context.draft, { 
    text: blockContext.fullText,
    inlineStyleRanges: blockContext.markups,
    entityRanges: blockContext.entities,
    data: { oliDepth: context.depth, semanticContext: context.semantic }
  });

}

function addTitleBlock(title: any, type: string, context: ParsingContext) {
  

  
  const values = { 
    type, 
    text: title,
    data: { oliType: 'title', semanticContext: context.semantic }
  };
  addNewBlock(context.draft, values);
}


function section(item: Object, context: ParsingContext) {

  const key = getKey(item);

   // Create a content block displaying the title text
  const values = { 
    type: getBlockStyleForDepth(context.depth + 1), 
    text: item[key][common.ARRAY][0].title[common.TEXT],
    data: { oliType: 'section.title', oliDepth: context.depth + 1}
  };
  addNewBlock(context.draft, values);

  // parse the body 
  context.depth++;
  parse(item[key][common.ARRAY][1], context);
}

function pullout(item: Object, context: ParsingContext) {

  const key = getKey(item);

  // Create the beginning block
  const beginData = {
    oliType: 'pullout',
    subType: item[key]['@type']
  };
  const beginBlock = addAtomicBlock(EntityTypes.pullout_begin, beginData, context);

  // Create the title block 
  if (item[key][common.TITLE] !== undefined) {
    addTitleBlock(item[key][common.TITLE], 'header-three', context);
  }
  
  // Handle the children
  const children = getChildren(item);
  
  const semanticContext = {
    beginBlock: beginBlock.key,
    oliType: 'pullout',
    subType: item[key]['@type']
  };
  context.semantic = semanticContext;

  children.forEach(subItem => parse(subItem, context));

  context.semantic = null;

  // Create then ending block 
  const endData = {
    oliType: 'pullout',
    subType: item[key]['@type'],
    beginBlock: beginBlock.key
  };
  addAtomicBlock(EntityTypes.pullout_end, endData, context);

}

function example(item: Object, context: ParsingContext) {

  const key = getKey(item);

  // Create the beginning block
  const beginData = {
    oliType: 'example'
  };
  const beginBlock = addAtomicBlock(EntityTypes.pullout_begin, beginData, context);

  // Create the title block 
  if (item[key][common.TITLE] !== undefined) {
    addTitleBlock(item[key][common.TITLE], 'header-three', context);
  }
  
  // Handle the children
  const children = getChildren(item);
  
  const semanticContext = {
    beginBlock: beginBlock.key,
    oliType: 'example',
    subType: null
  };
  context.semantic = semanticContext;

  children.forEach(subItem => parse(subItem, context));

  context.semantic = null;

  // Create the ending block 
  const endData = {
    oliType: 'example',
    subType: null,
    beginBlock: beginBlock.key
  };
  addAtomicBlock(EntityTypes.pullout_end, endData, context);

}

function body(item: Object, context: ParsingContext) {

  const key = getKey(item);
  item[key][common.ARRAY].forEach(subItem => parse(subItem, context));
}

function handleUnsupported(item: Object, context: ParsingContext) {
  addAtomicBlock(EntityTypes.unsupported, item, context);
}

function addAtomicBlock(type: string, item: Object, context: ParsingContext) : common.RawContentBlock {
  const entityKey = common.generateRandomKey();
  const values = { 
    type: 'atomic', 
    text: ' ',
    entityRanges: [{offset: 0, length: 1, key: entityKey}],
  };
  const block = addNewBlock(context.draft, values);
  context.draft.entityMap[entityKey] = {
    type,
    mutability: 'IMMUTABLE',
    data: item
  };

  return block;
}

function parse(item: Object, context: ParsingContext) {

  // item is an object with one key.  That key will be either 'section' or 'title'
  // or 'body' or 'p' or ...  

  // Get the key and then get the registered key handler
  const key = getKey(item);
  const handler = blockHandlers[key];

  if (handler === undefined) {
    handleUnsupported(item, context);
  } else {
    handler(item, context);
  }

}
