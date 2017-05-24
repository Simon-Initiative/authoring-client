import * as Immutable from 'immutable';

import { ContentState, ContentBlock, EntityMap, convertToRaw, convertFromRaw } from 'draft-js';
import * as common from './common';
import { CodeBlock } from './codeblock';
import { WbInline } from './wbinline';
import { Table } from './table';
import { Audio } from './audio';
import { Image } from './image';
import { IFrame } from './iframe';
import { Video } from './video';
import { YouTube } from './youtube';
import { Link } from './link';
import { Xref } from './xref';
import { ActivityLink } from './activity_link';
import { Cite } from './cite';


// Translation routines to convert from persistence model to draft model 



type ParsingContext = {
  draft : common.RawDraft, 
  depth: number,
};

type WorkingBlock = {
  fullText : string,
  markups : common.RawInlineStyle[],
  entities : common.RawEntityRange[],
};

type BlockHandler = (item: Object, context: ParsingContext) => void;
type InlineHandler = (
  offset: number, length: number, item: Object, 
  context: ParsingContext, workingBlock: WorkingBlock) => void;

const ol = listHandler.bind(undefined, 'ordered-list-item');
const ul = listHandler.bind(undefined, 'unordered-list-item');

const blockHandlers = {
  objref,
  'wb:inline': wb_inline,
  pullout,
  example,
  definition,
  pronunciation,
  translation,
  meaning,
  title,
  p: paragraph,
  section,
  body,
  ol,
  ul,
  codeblock,
  table,
  audio,
  image: imageBlock,
  formula: formulaBlock,
  quote: quoteBlock,
  // code: codeBlock,
  iframe,
  video,
  youtube,
  '#text': pureTextBlockHandler.bind(undefined, common.TEXT),
  '#cdata': pureTextBlockHandler.bind(undefined, common.CDATA),
  '#array': arrayHandler,
};

const inlineHandlers = {
  input_ref: insertEntity.bind(undefined, 'IMMUTABLE', common.EntityTypes.input_ref),
  activity_link: insertDataDrivenEntity.bind(
    undefined, 'MUTABLE', 
    common.EntityTypes.activity_link, 'activity_link', ActivityLink),
  xref: insertDataDrivenEntity.bind(
    undefined, 'MUTABLE', 
    common.EntityTypes.xref, 'xref', Xref),
  link: insertDataDrivenEntity.bind(
    undefined, 'MUTABLE', 
    common.EntityTypes.link, 'link', Link),
  cite: insertDataDrivenEntity.bind(
    undefined, 'MUTABLE', 
    common.EntityTypes.cite, 'cite', Cite),
  em,
  foreign: applyStyle.bind(undefined, 'UNDERLINE'),
  ipa: applyStyle.bind(undefined, 'UNDERLINE'),
  sub: applyStyle.bind(undefined, 'SUBSCRIPT'),
  sup: applyStyle.bind(undefined, 'SUPERSCRIPT'),
  term: applyStyle.bind(undefined, 'BOLD'),
  var: applyStyle.bind(undefined, 'ITALIC'),
  image: imageInline,
  'm:math': insertEntity.bind(undefined, 'IMMUTABLE', common.EntityTypes.math),
  quote: insertEntity.bind(undefined, 'IMMUTABLE', common.EntityTypes.quote),
  code: insertEntity.bind(undefined, 'MUTABLE', common.EntityTypes.code),
};

function applyStyle(
  style: string, offset: number, length: number, item: Object, 
  context: ParsingContext, workingBlock: WorkingBlock) {
  workingBlock.markups.push({ offset, length, style });
}

function em(
  offset: number, length: number, item: Object, 
  context: ParsingContext, workingBlock: WorkingBlock) {

  const style = common.styleMap[item[common.getKey(item)][common.STYLE]];
  workingBlock.markups.push({ offset, length, style });
}

function image(
  offset: number, length: number, item: Object, 
  context: ParsingContext, workingBlock: WorkingBlock) {

  const style = common.styleMap[item[common.getKey(item)][common.STYLE]];
  workingBlock.markups.push({ offset, length, style });
}


function extractAttrs(item: Object) : Object {
  const key = common.getKey(item);
  return Object
    .keys(item[key])
    .filter(key => key.startsWith('@'))
    .reduce(
      (o, k) => {
        o[k] = item[key][k];
        return o;
      }, 
      {});
}

function insertDataDrivenEntity(
  mutability: string, type: string, label, ctor, offset: number, length: number, item: Object, 
  context: ParsingContext, workingBlock: WorkingBlock) {

  const key = common.generateRandomKey();

  workingBlock.entities.push({ offset, length, key });
  
  const data = {};
  data[label] = ctor.fromPersistence(item);

  context.draft.entityMap[key] = {
    type,
    mutability,
    data,
  };
}


function insertEntity(
  mutability: string, type: string, offset: number, length: number, item: Object, 
  context: ParsingContext, workingBlock: WorkingBlock) {

  const key = common.generateRandomKey();

  workingBlock.entities.push({ offset, length, key });
  
  const data = extractAttrs(item);
  data[common.CDATA] = item[common.getKey(item)][common.CDATA];
  data[common.TEXT] = item[common.getKey(item)][common.TEXT];
  
  context.draft.entityMap[key] = {
    type,
    mutability,
    data,
  };
}

function imageInline(
  offset: number, length: number, item: Object, 
  context: ParsingContext, workingBlock: WorkingBlock) {

  const key = common.generateRandomKey();

  workingBlock.entities.push({ offset, length, key });

  const image = Image.fromPersistence(item, '');
  
  context.draft.entityMap[key] = {
    type: common.EntityTypes.image,
    mutability: 'IMMUTABLE',
    data: { image },
  };
}

function wb_inline(item: Object, context: ParsingContext) {
  const wb = WbInline.fromPersistence(item, '');
  addAtomicBlock(common.EntityTypes.wb_inline, { wbinline: wb }, context);
}

function codeblock(item: Object, context: ParsingContext) {

  const codeblock = CodeBlock.fromPersistence(item, '');
  addAtomicBlock(common.EntityTypes.codeblock, { codeblock }, context);
}

function quoteBlock(item: Object, context: ParsingContext) {

  const children = getChildren(item);
  
  const blockContext = {
    fullText: '',
    markups : [],
    entities : [],
  };

  children.forEach(subItem => processInline(subItem, context, blockContext));

  addNewBlock(context.draft, { 
    text: blockContext.fullText,
    inlineStyleRanges: blockContext.markups,
    entityRanges: blockContext.entities,
    type: 'blockquote',
  });
}

function formulaBlock(item: Object, context: ParsingContext) {

  const children = getChildren(item);
  
  const blockContext = {
    fullText: '',
    markups : [],
    entities : [],
  };

  children.forEach(subItem => processInline(subItem, context, blockContext));

  addNewBlock(context.draft, { 
    text: blockContext.fullText,
    inlineStyleRanges: blockContext.markups,
    entityRanges: blockContext.entities,
    type: 'formula',
  });
}

function audio(item: Object, context: ParsingContext) {

  const audio = Audio.fromPersistence(item, '');
  addAtomicBlock(common.EntityTypes.audio, { audio }, context);
}

function imageBlock(item: Object, context: ParsingContext) {

  const image = Image.fromPersistence(item, '');
  addAtomicBlock(common.EntityTypes.image, { image }, context);
}

function video(item: Object, context: ParsingContext) {

  const video = Video.fromPersistence(item, '');
  addAtomicBlock(common.EntityTypes.video, { video }, context);
}

function iframe(item: Object, context: ParsingContext) {

  const iframe = IFrame.fromPersistence(item, '');
  addAtomicBlock(common.EntityTypes.iframe, { iframe }, context);
}

function youtube(item: Object, context: ParsingContext) {

  const youtube = YouTube.fromPersistence(item, '');
  addAtomicBlock(common.EntityTypes.youtube, { youtube }, context);
}

function table(item: Object, context: ParsingContext) {

  const table = Table.fromPersistence(item, '');
  addAtomicBlock(common.EntityTypes.table, { table }, context);
}


function getInlineHandler(key: string) : InlineHandler {
  if (inlineHandlers[key] !== undefined) {
    return inlineHandlers[key];
  } else {
    return applyStyle.bind(undefined, 'UNSUPPORTED');
  }
}


export function toDraft(persistenceFormat: Object) : ContentState {
  
  const draft : common.RawDraft = {
    entityMap : {},
    blocks : [],
  };
  
  parse(persistenceFormat, { draft, depth: 0 });
  
  // Add a final empty block that will ensure that we have content past
  // any last positioned atomic blocks. This allows the user to click
  // past the last atomic block and begin inserting new text
  if (draft.blocks[draft.blocks.length - 1].type === 'atomic') {
    addNewBlock(draft, {});
  }
  
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
    data: { type: '' },
  };
  const block : common.RawContentBlock = Object.assign({}, defaultBlock, values);
  params.blocks.push(block);

  return block;
}


function listHandler(listBlockType, item: Object, context: ParsingContext) {
  const key = common.getKey(item);
  item[key][common.ARRAY].forEach((listItem) => {

    const children = getChildren(listItem);
  
    const blockContext = {
      fullText: '',
      markups : [],
      entities : [],
    };

    children.forEach(subItem => processInline(subItem, context, blockContext));

    addNewBlock(context.draft, { 
      text: blockContext.fullText,
      inlineStyleRanges: blockContext.markups,
      entityRanges: blockContext.entities,
      type: listBlockType,
    });
  });
}

function getChildren(item: Object, ignore = null) : Object[] {
  const key = common.getKey(item);
  if (item[key][common.ARRAY] !== undefined) {
    return item[key][common.ARRAY].filter(c => common.getKey(c) !== ignore);
  } else if (item[key][common.TEXT] !== undefined) {
    return [item[key]];
  } else if (item[key][common.CDATA] !== undefined) {
    return [item[key]];
  } else {
    return [item[key]];
  }
}

function processInline(
  item: Object, 
  context: ParsingContext, blockContext: WorkingBlock) {
  
  const key = common.getKey(item);

  if (key === common.CDATA || key === common.TEXT) {

    blockContext.fullText += item[key];

  } else {
    
    const offset = blockContext.fullText.length;

    // TODO fix this in a more general way 
    if (key === 'math' || key === 'input_ref') {
      blockContext.fullText += ' ';

    } else {

      const children = getChildren(item);

      children.forEach((subItem) => {
        const subKey = common.getKey(subItem);
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

function paragraph(item: Object, context: ParsingContext) {
  
  const children = getChildren(item);
  
  const blockContext = {
    fullText: '',
    markups : [],
    entities : [],
  };

  children.forEach(subItem => processInline(subItem, context, blockContext));

  addNewBlock(context.draft, { 
    text: blockContext.fullText,
    inlineStyleRanges: blockContext.markups,
    entityRanges: blockContext.entities,
  });

}

function pureTextBlockHandler(key: string, item: Object, context: ParsingContext) {
  addNewBlock(context.draft, { 
    text: item[key],
    inlineStyleRanges: [],
    entityRanges: [],
  });
}

function arrayHandler(item: Object, context: ParsingContext) {
  item['#array'].forEach(item => parse(item, context));
}

function createRichTitle(
  item: Object, context: ParsingContext, blockType: string, beginBlockKey: string) {
  
  const children = getChildren(item);
  
  const blockContext = {
    fullText: '',
    markups : [],
    entities : [],
  };

  children.forEach(subItem => processInline(subItem, context, blockContext));

  addNewBlock(context.draft, { 
    type: blockType,
    text: blockContext.fullText,
    inlineStyleRanges: blockContext.markups,
    entityRanges: blockContext.entities,
    data: { type: 'title', beginBlockKey },
  });

}



function createSimpleTitle(
  title: string, context: ParsingContext, type: string, beginBlockKey: string) {

  const values = { 
    type, 
    text: title,
    data: { type: 'title', beginBlockKey },
  };
  addNewBlock(context.draft, values);
}


function section(item: Object, context: ParsingContext) {

  const key = common.getKey(item);
  const beginData : common.SectionBegin = {
    type: 'section_begin',
    purpose: extractAttrs(item)['@purpose'],
  };
  
  const beginBlock = addAtomicBlock(common.EntityTypes.section_begin, beginData, context);

   // Create a content block displaying the title text
  processTitle(item, context, getBlockStyleForDepth(context.depth + 1), beginBlock.key);

  // parse the body 
  context.depth += 1;
  parse(item[key][common.ARRAY][1], context);
  context.depth -= 1; 

  // Create then ending block 
  const endData : common.SectionEnd = {
    type: 'section_end',
    purpose: extractAttrs(item)['@purpose'],
  };
  addAtomicBlock(common.EntityTypes.section_end, endData, context);
}

function pullout(item: Object, context: ParsingContext) {

  const key = common.getKey(item);

  // Create the beginning block
  const beginData : common.PulloutBegin = {
    type: 'pullout_begin',
    subType: item[key]['@type'],
  };
  const beginBlock = addAtomicBlock(common.EntityTypes.pullout_begin, beginData, context);

  // Process the title
  processTitle(item, context, 'header-three', beginBlock.key);
  
  // Handle the children, excluding 'title'
  const children = getChildren(item, 'title');
  children.forEach(subItem => parse(subItem, context));

  // Create then ending block 
  const endData : common.PulloutEnd = {
    type: 'pullout_end',
    subType: item[key]['@type'],
  };
  addAtomicBlock(common.EntityTypes.pullout_end, endData, context);

}

function definition(item: Object, context: ParsingContext) {

  const key = common.getKey(item);

  const terms = getChildren(item).filter(c => common.getKey(c) === 'term');
  const term = terms.length === 0 ? 'unknown term ' : (terms[0] as any).term[common.TEXT];

  // Create the beginning block
  const beginData : common.DefinitionBegin = {
    type: 'definition_begin',
    term,
  };
  const beginBlock = addAtomicBlock(common.EntityTypes.definition_begin, beginData, context);

  // Handle the children, excluding 'term'
  const children = getChildren(item, 'term');
  children.forEach(subItem => parse(subItem, context));

  // Create the ending block 
  const endData : common.DefinitionEnd = {
    type: 'definition_end',
  };
  addAtomicBlock(common.EntityTypes.definition_end, endData, context);

}

function pronunciation(item: Object, context: ParsingContext) {

  const key = common.getKey(item);

  const src = item[key]['@src'];
  const srcType = item[key]['@type'];

  // Create the beginning block
  const beginData : common.PronunciationBegin = {
    type: 'pronunciation_begin',
    src,
    srcType,
  };
  const beginBlock = addAtomicBlock(common.EntityTypes.pronunciation_begin, beginData, context);

  // Handle the children
  const children = getChildren(item);
  children.forEach(subItem => parse(subItem, context));

  // Create the ending block 
  const endData : common.PronunciationEnd = {
    type: 'pronunciation_end',
  };
  addAtomicBlock(common.EntityTypes.pronunciation_end, endData, context);

}

function translation(item: Object, context: ParsingContext) {

  const key = common.getKey(item);

  // Create the beginning block
  const beginData : common.TranslationBegin = {
    type: 'translation_begin',
  };
  const beginBlock = addAtomicBlock(common.EntityTypes.translation_begin, beginData, context);

  // Handle the children
  const children = getChildren(item);
  children.forEach(subItem => parse(subItem, context));

  // Create the ending block 
  const endData : common.TranslationEnd = {
    type: 'translation_end',
  };
  addAtomicBlock(common.EntityTypes.translation_end, endData, context);

}

function meaning(item: Object, context: ParsingContext) {

  const key = common.getKey(item);

  // Create the beginning block
  const beginData : common.MeaningBegin = {
    type: 'meaning_begin',
  };
  const beginBlock = addAtomicBlock(common.EntityTypes.meaning_begin, beginData, context);

  // Handle the children
  const children = getChildren(item);
  children.forEach(subItem => parse(subItem, context));

  // Create the ending block 
  const endData : common.MeaningEnd = {
    type: 'meaning_end',
  };
  addAtomicBlock(common.EntityTypes.meaning_end, endData, context);

}

function title(item: Object, context: ParsingContext) {

  const key = common.getKey(item);

  // Create the beginning block
  const beginData : common.TitleBegin = {
    type: 'title_begin',
  };
  const beginBlock = addAtomicBlock(common.EntityTypes.title_begin, beginData, context);

  // Handle the children
  const children = getChildren(item);
  children.forEach(subItem => parse(subItem, context));

  // Create the ending block 
  const endData : common.TitleEnd = {
    type: 'title_end',
  };
  addAtomicBlock(common.EntityTypes.title_end, endData, context);

}

function processTitle(
  item: Object, context: ParsingContext, titleStyle: string, beginBlockKey: string) {

  const key = common.getKey(item);

  // There are three options:
  // 1. A title element is present (which can contain rich text) OR
  // 2. A title attribute is present with text OR
  // 3. A title attribute is present with empty string or the title attribute is missing
  const titleAttribute = item[key][common.TITLE];
  const titleElements = getChildren(item).filter(c => common.getKey(c) === 'title');

  if (titleElements.length === 1) {
    createRichTitle(titleElements[0], context, titleStyle, beginBlockKey);
  } else if (titleAttribute !== undefined && titleAttribute !== '') {
    createSimpleTitle(titleAttribute, context, titleStyle, beginBlockKey);
  } 
}

function example(item: Object, context: ParsingContext) {

  const key = common.getKey(item);

  // Create the beginning block
  const beginData : common.ExampleBegin = {
    type: 'example_begin',
  };
  const beginBlock = addAtomicBlock(common.EntityTypes.example_begin, beginData, context);

  // Process the title
  processTitle(item, context, 'header-three', beginBlock.key);

  // Handle the children, ignoring 'title'
  const children = getChildren(item, 'title');
  children.forEach(subItem => parse(subItem, context));

  // Create the ending block 
  const endData : common.ExampleEnd = {
    type: 'example_end',
  };
  addAtomicBlock(common.EntityTypes.example_end, endData, context);

}

function body(item: Object, context: ParsingContext) {

  const children = getChildren(item);
  children.forEach(subItem => parse(subItem, context));
}

function handleUnsupported(item: Object, context: ParsingContext) {
  addAtomicBlock(common.EntityTypes.unsupported, item, context);
}

function objref(item: Object, context: ParsingContext) {
  addAtomicBlock(common.EntityTypes.objref, item, context);
}

function addAtomicBlock(
  type: string, item: Object, context: ParsingContext) : common.RawContentBlock {
  const entityKey = common.generateRandomKey();
  const values = { 
    type: 'atomic', 
    text: ' ',
    entityRanges: [{ offset: 0, length: 1, key: entityKey }],
  };
  const block = addNewBlock(context.draft, values);
  context.draft.entityMap[entityKey] = {
    type,
    mutability: 'IMMUTABLE',
    data: item,
  };

  return block;
}

function parse(item: Object, context: ParsingContext) {

  // item is an object with one key.  That key will be either 'section' or 'title'
  // or 'body' or 'p' or ...  

  // Get the key and then get the registered key handler
  const key = common.getKey(item);
  const handler = blockHandlers[key];

  if (handler === undefined) {
    handleUnsupported(item, context);
  } else {
    handler(item, context);
  }

}
