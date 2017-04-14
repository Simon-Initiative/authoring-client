import * as Immutable from 'immutable';

import { ContentState, ContentBlock, EntityMap, convertToRaw, convertFromRaw} from 'draft-js';
import { HtmlContent } from '../../../../../data/contentTypes';
import * as common from './common';
import { getKey } from './common';
import { EntityTypes } from '../custom';

// Translation routines to convert from persistence model to draft model 



type ParsingContext = {
  draft : common.RawDraft, 
  depth: number
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
  objref,
  wb_inline,
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
  activity_link: insertEntity.bind(undefined, 'MUTABLE', EntityTypes.activity_link),
  xref: insertEntity.bind(undefined, 'MUTABLE', EntityTypes.xref),
  wb_manual: insertEntity.bind(undefined, 'MUTABLE', EntityTypes.wb_manual),
  link: insertEntity.bind(undefined, 'MUTABLE', EntityTypes.link),
  cite: insertEntity.bind(undefined, 'MUTABLE', EntityTypes.cite),
  em,
  foreign: applyStyle.bind(undefined, 'UNDERLINE'),
  ipa: applyStyle.bind(undefined, 'UNDERLINE'),
  sub: applyStyle.bind(undefined, 'SUBSCRIPT'),
  sup: applyStyle.bind(undefined, 'SUPERSCRIPT'),
  term: applyStyle.bind(undefined, 'BOLD'),
  var: applyStyle.bind(undefined, 'ITALIC'),
  image: insertEntity.bind(undefined, 'IMMUTABLE', EntityTypes.image),
  math: insertEntity.bind(undefined, 'IMMUTABLE', EntityTypes.formula),
  quote: insertEntity.bind(undefined, 'MUTABLE', EntityTypes.quote),
  code: insertEntity.bind(undefined, 'MUTABLE', EntityTypes.code)
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
  data[common.CDATA] = item[getKey(item)][common.CDATA];
  data[common.TEXT] = item[getKey(item)][common.TEXT];
  
  context.draft.entityMap[key] = {
    type,
    mutability,
    data
  }
}

function wb_inline(item: Object, context: ParsingContext) {
  addAtomicBlock(EntityTypes.wb_inline, item, context);
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
  
  parse(htmlContent, { draft, depth: 0 });
  
  // Add a final empty block that will ensure that we have content past
  // any last positioned atomic blocks
  addNewBlock(draft, {});

  console.log(draft);

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



function addNewBlock(params : common.RawDraft, values : Object) : common.RawContentBlock {
  const defaultBlock : common.RawContentBlock = {
    key: common.generateRandomKey(),
    text: ' ',
    type: 'unstyled',
    depth: 0,
    inlineStyleRanges: [],
    entityRanges: [],
    data: { type: ''}
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
      type: listBlockType
    });
  });
}

function getChildren(item: Object, ignore = null) : Object[] {
  const key = getKey(item);
  if (item[key][common.ARRAY] !== undefined) {
    return item[key][common.ARRAY].filter(c => getKey(c) !== ignore);
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

    if (key === 'math') {

      blockContext.fullText += ' ';

    } else {

      children.forEach(subItem => {
        const subKey = getKey(subItem);
        if (subKey === common.CDATA || subKey === common.TEXT) {
          blockContext.fullText += subItem[subKey];
        } else {
          processInline(subItem, context, blockContext);
        }
      });

    }
    
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
    entityRanges: blockContext.entities
  });

}

function createRichTitle(item: Object, context: ParsingContext, blockType: string, beginBlockKey: string) {
  
  const children = getChildren(item);
  
  const blockContext = {
    fullText: '',
    markups : [],
    entities : []
  }

  children.forEach(subItem => processInline(subItem, context, blockContext));

  addNewBlock(context.draft, { 
    type: blockType,
    text: blockContext.fullText,
    inlineStyleRanges: blockContext.markups,
    entityRanges: blockContext.entities,
    data: { type: 'title', beginBlockKey }
  });

}



function createSimpleTitle(title: string, context: ParsingContext, type: string, beginBlockKey: string) {

  const values = { 
    type, 
    text: title,
    data: { type: 'title', beginBlockKey }
  };
  addNewBlock(context.draft, values);
}


function section(item: Object, context: ParsingContext) {

  const key = getKey(item);
  const beginData : common.SectionBegin = {
    type: 'section_begin',
    '@purpose': extractAttrs(item)['@purpose']
  };
  
  const beginBlock = addAtomicBlock(EntityTypes.section_begin, beginData, context);

   // Create a content block displaying the title text
  processTitle(item, context, getBlockStyleForDepth(context.depth + 1), beginBlock.key);

  // parse the body 
  context.depth++;
  parse(item[key][common.ARRAY][1], context);
  context.depth--; 

  // Create then ending block 
  const endData : common.SectionEnd = {
    type: 'section_end',
    '@purpose': extractAttrs(item)['@purpose'],
    beginBlockKey: beginBlock.key
  };
  addAtomicBlock(EntityTypes.section_end, endData, context);
}

function pullout(item: Object, context: ParsingContext) {

  const key = getKey(item);

  // Create the beginning block
  const beginData : common.PulloutBegin = {
    type: 'pullout_begin',
    subType: item[key]['@type']
  };
  const beginBlock = addAtomicBlock(EntityTypes.pullout_begin, beginData, context);

  // Process the title
  processTitle(item, context, 'header-three', beginBlock.key);
  
  // Handle the children, excluding 'title'
  const children = getChildren(item, 'title');
  children.forEach(subItem => parse(subItem, context));

  // Create then ending block 
  const endData : common.PulloutEnd = {
    type: 'pullout_end',
    subType: item[key]['@type'],
    beginBlockKey: beginBlock.key
  };
  addAtomicBlock(EntityTypes.pullout_end, endData, context);

}

function processTitle(item: Object, context: ParsingContext, titleStyle: string, beginBlockKey: string) {

  const key = getKey(item);

  // There are three options:
  // 1. A title element is present (which can contain rich text) OR
  // 2. A title attribute is present with text OR
  // 3. A title attribute is present with empty string or the title attribute is missing
  const titleAttribute = item[key][common.TITLE];
  const titleElements = getChildren(item).filter(c => getKey(c) === 'title');

  if (titleElements.length === 1) {
    createRichTitle(titleElements[0], context, titleStyle, beginBlockKey);
  } else if (titleAttribute !== undefined && titleAttribute !== '') {
    createSimpleTitle(titleAttribute, context, titleStyle, beginBlockKey);
  } 
}

function example(item: Object, context: ParsingContext) {

  const key = getKey(item);

  // Create the beginning block
  const beginData : common.ExampleBegin = {
    type: 'example_begin'
  };
  const beginBlock = addAtomicBlock(EntityTypes.pullout_begin, beginData, context);

  // Process the title
  processTitle(item, context, 'header-three', beginBlock.key);

  // Handle the children, ignoring 'title'
  const children = getChildren(item, 'title');
  children.forEach(subItem => parse(subItem, context));

  // Create the ending block 
  const endData : common.ExampleEnd = {
    type: 'example_end',
    beginBlockKey: beginBlock.key
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

function objref(item: Object, context: ParsingContext) {
  addAtomicBlock(EntityTypes.objref, item, context);
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
