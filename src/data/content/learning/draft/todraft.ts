import { ContentState, convertFromRaw } from 'draft-js';
import * as common from '../common';
import { registeredTypes } from '../../common/parse';
import guid from 'utils/guid';

let inlineHandlers = null;

export function toDraft(toParse: Object[]) : ContentState {

  const draft : common.RawDraft = {
    entityMap : {},
    blocks : [],
  };

  toParse.forEach(entry => parse(entry, { draft, depth: 0 }));

  return convertFromRaw(draft);
}


const blockHandlers = {
  p: paragraph,
  '#text': pureTextBlockHandler.bind(undefined, common.TEXT),
  '#cdata': pureTextBlockHandler.bind(undefined, common.CDATA),
  '#array': arrayHandler,
};

// Translation routines to convert from persistence model to draft model

const inlineTerminalTags = {};
inlineTerminalTags['m:math'] = true;
inlineTerminalTags['#math'] = true;
inlineTerminalTags['input_ref'] = true;
inlineTerminalTags['image'] = true;

const inlineTagsDefaultContent = {};
inlineTagsDefaultContent['cite'] = ' ';


type ParsingContext = {
  draft : common.RawDraft,
  depth: number,
};

type WorkingBlock = {
  fullText : string,
  markups : common.RawInlineStyle[],
  entities : common.RawEntityRange[],
};

type InlineHandler = (
  offset: number, length: number, item: Object,
  context: ParsingContext,
  workingBlock: WorkingBlock,
  blockBeforeChildren: WorkingBlock) => void;


function getInlineHandlers() {
  const inlineHandlers = {
    input_ref: insertEntity.bind(undefined, 'IMMUTABLE', common.EntityTypes.input_ref),
    activity_link: insertDataDrivenEntity.bind(
      undefined, 'MUTABLE',
      common.EntityTypes.activity_link, 'activity_link', registeredTypes['activity_link']),
    xref: insertDataDrivenEntity.bind(
      undefined, 'MUTABLE',
      common.EntityTypes.xref, 'xref', registeredTypes['xref']),
    link: insertDataDrivenEntity.bind(
      undefined, 'MUTABLE',
      common.EntityTypes.link, 'link', registeredTypes['link']),
    cite: insertDataDrivenEntity.bind(
      undefined, 'MUTABLE',
      common.EntityTypes.cite, 'cite', registeredTypes['cite']),
    em,
    foreign: applyStyle.bind(undefined, 'UNDERLINE'),
    ipa: applyStyle.bind(undefined, 'UNDERLINE'),
    sub: applyStyle.bind(undefined, 'SUBSCRIPT'),
    sup: applyStyle.bind(undefined, 'SUPERSCRIPT'),
    term: applyStyle.bind(undefined, 'BOLD'),
    var: applyStyle.bind(undefined, 'ITALIC'),
    image: imageInline,
    formula: formulaInline,
    '#math': hashMath,
    'm:math': insertEntity.bind(undefined, 'IMMUTABLE', common.EntityTypes.math),
    quote: insertEntity.bind(undefined, 'IMMUTABLE', common.EntityTypes.quote),
    code: insertEntity.bind(undefined, 'MUTABLE', common.EntityTypes.code),
  };
  return inlineHandlers;
}

function activityLinkBlock(item: Object, context: ParsingContext) {
  const blockContext = {
    fullText: '',
    markups : [],
    entities : [],
  };

  processInline(item, context, blockContext);

  addNewBlock(context.draft, {
    text: blockContext.fullText,
    inlineStyleRanges: blockContext.markups,
    entityRanges: blockContext.entities,
    type: 'unstyled',
  });
}

function applyStyle(
  style: string, offset: number, length: number, item: Object,
  context: ParsingContext, workingBlock: WorkingBlock) {
  workingBlock.markups.push({ offset, length, style });
}

function em(
  offset: number, length: number, item: Object,
  context: ParsingContext, workingBlock: WorkingBlock) {

  // Handle the case of no @style tag - treat it as italic
  const em = item[common.getKey(item)];
  let style;
  if (em[common.STYLE] === undefined) {
    style = 'ITALIC';
  } else {
    style = common.styleMap[em[common.STYLE]];
  }

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
  mutability: string, type: string, label,
  fromPersistence, offset: number, length: number, item: Object,
  context: ParsingContext, workingBlock: WorkingBlock) {

  const key = common.generateRandomKey();

  workingBlock.entities.push({ offset, length, key });

  const data = {};
  data[label] = registeredTypes[type](item);

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

function hashMath(
  offset: number, length: number, item: Object,
  context: ParsingContext, workingBlock: WorkingBlock) {

  const key = common.generateRandomKey();

  workingBlock.entities.push({ offset, length, key });

  const data = {};
  data['#math'] = item['#math'];

  context.draft.entityMap[key] = {
    type: common.EntityTypes.math,
    mutability: 'IMMUTABLE',
    data,
  };
}

function imageInline(
  offset: number, length: number, item: Object,
  context: ParsingContext, workingBlock: WorkingBlock) {

  const key = common.generateRandomKey();

  workingBlock.entities.push({ offset, length, key });

  const image = registeredTypes['image'](item, '');

  context.draft.entityMap[key] = {
    type: common.EntityTypes.image,
    mutability: 'IMMUTABLE',
    data: { image },
  };
}

function formulaInline(
  offset: number, length: number, item: Object,
  context: ParsingContext, workingBlock: WorkingBlock,
  blockBeforeChildren: WorkingBlock) {

  // Adjust the full text to account for our insertion of
  // the formula sentinels
  workingBlock.fullText = workingBlock.fullText.substr(0, offset)
    + ' ' + workingBlock.fullText.substr(offset) + ' ';

  // Adjust markup and entities that were added by children
  const markupsStart = workingBlock.markups.length
    - (workingBlock.markups.length - blockBeforeChildren.markups.length);
  const entitiesStart = workingBlock.entities.length
    - (workingBlock.entities.length - blockBeforeChildren.entities.length);

  for (let i = markupsStart; i < workingBlock.markups.length; i += 1) {
    workingBlock.markups[i].offset += 1;
  }
  for (let i = entitiesStart; i < workingBlock.entities.length; i += 1) {
    workingBlock.entities[i].offset += 1;
  }

  // Now add the sentinels
  insertEntity(
    'IMMUTABLE', common.EntityTypes.formula_begin,
    offset, 1, item, context, workingBlock);

  insertEntity(
    'IMMUTABLE', common.EntityTypes.formula_end,
    offset + length + 1, 1, item, context, workingBlock);
}


function getInlineHandler(key: string) : InlineHandler {

  // Lazily initialize the handlers to avoid a webpack
  // module import problem
  if (inlineHandlers === null) {
    inlineHandlers = getInlineHandlers();
  }

  if (inlineHandlers[key] !== undefined) {
    return inlineHandlers[key];
  }

  return applyStyle.bind(undefined, 'UNSUPPORTED');
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


function getChildren(item: Object, ignore = null) : Object[] {

  const key = common.getKey(item);

  // Handle a case where there is no key
  if (key === undefined) {
    return [];
  }

  if (item[key][common.ARRAY] !== undefined) {
    return item[key][common.ARRAY].filter(c => common.getKey(c) !== ignore);
  }
  if (item[key][common.TEXT] !== undefined) {
    return [item[key]];
  }
  if (item[key][common.CDATA] !== undefined) {
    return [item[key]];
  }

  return [item[key]];
}

function cloneWorkingBlock(blockContext: WorkingBlock) : WorkingBlock {
  return {
    fullText: blockContext.fullText,
    markups: [...blockContext.markups],
    entities: [...blockContext.entities],
  };
}

function processInline(
  item: Object,
  context: ParsingContext, blockContext: WorkingBlock) {

  const key = common.getKey(item);

  if (key === common.CDATA || key === common.TEXT) {

    blockContext.fullText += item[key];

  } else {

    const offset = blockContext.fullText.length;

    const blockBeforeChildren = cloneWorkingBlock(blockContext);

    // Handle elements that do not have children, but
    // do require a specialized entity renderer
    if (inlineTerminalTags[key]) {
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

      // If a tag's children provided no additional content,
      // set the default content for that tag, if one is defined.
      // This exists primarily to support empty 'cite' tags
      // that have to have at least a space to be able to render,
      // and thus be preserved
      if (blockContext.fullText === blockBeforeChildren.fullText
        && inlineTagsDefaultContent[key]) {
        blockContext.fullText += inlineTagsDefaultContent[key];
      }

    }

    const text = blockContext.fullText.substring(offset);
    const handler = getInlineHandler(key);
    handler(offset, text.length, item, context, blockContext, blockBeforeChildren);
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
    data: extractIdTitle(item),
    text: blockContext.fullText,
    inlineStyleRanges: blockContext.markups,
    entityRanges: blockContext.entities,
  });

}

function extractIdTitle(item: Object) : Object {
  const data = { id: '', title: '', type: '' };
  if (item !== undefined && item !== null && item['@id'] !== undefined) {
    data.id = item['@id'];
  } else {
    data.id = guid();
  }
  if (item !== undefined && item !== null && item['@title'] !== undefined) {
    data.title = item['@title'];
  }
  return data;
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

function parse(item: Object, context: ParsingContext) {

  // item is an object with one key.

  // Get the key and then get the registered key handler
  const key = common.getKey(item);

  // Handle the case where we have keyless data...aka, a blank
  // JS object.  Just ignore it in the UI, but log to the console
  if (key === undefined) {
    return;
  }

  const handler = blockHandlers[key];

  if (handler === undefined) {
    console.log('Unsupported Text content encountered: key = [' + key + '], contents next line');
    console.dir(item);

  } else {
    handler(item, context);
  }

}
