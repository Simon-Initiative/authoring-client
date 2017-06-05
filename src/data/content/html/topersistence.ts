import * as Immutable from 'immutable';

import { ContentState, CharacterMetadata, ContentBlock, 
  EntityMap, convertToRaw, convertFromRaw } from 'draft-js';

import { CodeBlock } from './codeblock';
import { WbInline } from './wbinline';
import { Table } from './table';

import * as common from './common';
import { Block, BlockIterator, BlockProvider } from './provider';

// Translation routine from draft model to persistence model 


// A mapping of inline sytles to the persistence
// object trees needed to represent them.  Functions
// are present here to provide a poor-man's immutability. 
const styleContainers = {
  BOLD: () => ({ em: { '@style': 'bold' } }),
  ITALIC: () => ({ em: { '@style': 'italic' } }),
  CODE: () => ({ var: { } }),
  TERM: () => ({ term: { } }),
  IPA: () => ({ ipa: { } }),
  FOREIGN: () => ({ foreign: { } }),
  SUBSCRIPT: () => ({ sub: { } }),
  SUPERSCRIPT: () => ({ sup: { } }),
};

type Container = Object[];
type Stack = Container[];

type InlineOrEntity = common.RawInlineStyle | common.RawEntityRange;

type OverlappingRanges = {
  offset: number,
  length: number,
  ranges: InlineOrEntity[],
};

type EntityHandler = (
  s : common.RawEntityRange, text : string, entityMap : common.RawEntityMap) => Object;

const entityHandlers = {
  activity_link,
  xref,
  link,
  math,
  input_ref,
  cite,
  quote,
};

// Converts the draft ContentState object to the HtmlContent format
// (which ultimately is serialized and stored in persistence)
export function toPersistence(state: ContentState) : Object {

  const rawContent = convertToRaw(state);
  return translate(rawContent, state);
}

function translate(content: common.RawDraft, state: ContentState) : Object {

  // Create a top-level container for the object tree to root itself into
  const root = { body: { '#array': [] } };
  const context = [root.body['#array']];  

  // Start iterating through the blocks, converting them as we go.
  // The iterator pattern is used here instead of a for-loop since some
  // blocks are processed as groups - so we need to be able to provide
  // the iterator to the block processing function so that it can 
  // access additional blocks if needed. 
  const iterator = new BlockProvider(content.blocks, state);
  while (iterator.hasNext()) {
    translateBlock(iterator, content.entityMap, context);
  }

  return root.body;
}

function translateBlock(
  iterator : BlockIterator,
  entityMap : common.RawEntityMap, context: Stack) {
  
  const block = iterator.next();
  const rawBlock = block.rawBlock;
  const draftBlock = block.block;

  const sentinelType = getSentinelType(rawBlock, entityMap);

  if (sentinelType !== null) {
    handleSentinelTransition(sentinelType, iterator, rawBlock, entityMap, context);

  } else if (isParagraphBlock(rawBlock)) {

    // If the last block is an empty paragraph, do not translate it
    if (rawBlock.text === ' ' && iterator.peek() === null) {
      return;
    }

    translateParagraph(rawBlock, draftBlock, entityMap, context);

  } else if (isOrderedListBlock(rawBlock)) {
    translateList('ol', rawBlock, block, iterator, entityMap, context);
  } else if (isUnorderedListBlock(rawBlock)) {
    translateList('ul', rawBlock, block, iterator, entityMap, context);
  } else if (isTable(rawBlock, entityMap)) {
    translateTable(rawBlock, draftBlock, entityMap, context);
  } else if (isCodeBlock(rawBlock, entityMap)) {
    translateCodeBlock(rawBlock, draftBlock, entityMap, context);
  } else if (isQuoteBlock(rawBlock)) {
    translateQuoteBlock(rawBlock, draftBlock, entityMap, context);
  } else if (isBasicCodeBlock(rawBlock)) {
    translateBasicCodeBlock(rawBlock, draftBlock, entityMap, context);
  } else if (isFormulaBlock(rawBlock)) {
    translateFormulaBlock(rawBlock, draftBlock, entityMap, context);
  } else if (isWbInline(rawBlock, entityMap)) {
    translateWbInline(rawBlock, draftBlock, entityMap, context);
  } else if (isCustom('audio', rawBlock, entityMap)) {
    translateAtomic('audio', rawBlock, draftBlock, entityMap, context);
  } else if (isCustom('video', rawBlock, entityMap)) {
    translateAtomic('video', rawBlock, draftBlock, entityMap, context);
  } else if (isCustom('youtube', rawBlock, entityMap)) {
    translateAtomic('youtube', rawBlock, draftBlock, entityMap, context);
  } else if (isCustom('iframe', rawBlock, entityMap)) {
    translateAtomic('iframe', rawBlock, draftBlock, entityMap, context);
  } else if (isCustom('activity', rawBlock, entityMap)) {
    translateAtomic('activity', rawBlock, draftBlock, entityMap, context);
  } else {  
    translateUnsupported(rawBlock, draftBlock, entityMap, context);
  }
  
}



const top = (stack : Stack) => stack[stack.length - 1];

function handleSentinelTransition(
  type: common.EntityTypes, iterator: BlockIterator, 
  rawBlock: common.RawContentBlock, entityMap: common.RawEntityMap, context: Stack) {

  if (type.endsWith('_end')) {
    // Simply pop the context stack
    context.pop();

  } else if (type === common.EntityTypes.section_begin) {
    translateSection(iterator, rawBlock, entityMap, context);

  } else if (type === common.EntityTypes.pullout_begin) {
    translatePullout(iterator, rawBlock, entityMap, context);

  } else if (type === common.EntityTypes.example_begin) {
    translateExample(iterator, rawBlock, entityMap, context);

  } else if (type === common.EntityTypes.definition_begin) {
    translateDefinition(iterator, rawBlock, entityMap, context);

  } else if (type === common.EntityTypes.title_begin) {
    translateTitle(iterator, rawBlock, entityMap, context);

  } else if (type === common.EntityTypes.material_begin) {
    translateMaterial(iterator, rawBlock, entityMap, context);

  } else if (type === common.EntityTypes.pronunciation_begin) {
    translatePronunciation(iterator, rawBlock, entityMap, context);

  } else if (type === common.EntityTypes.translation_begin) {
    translateTranslation(iterator, rawBlock, entityMap, context);

  } else if (type === common.EntityTypes.meaning_begin) {
    translateMeaning(iterator, rawBlock, entityMap, context);

  } 

}

function getSentinelType(
  rawBlock: common.RawContentBlock, entityMap: common.RawEntityMap) : common.EntityTypes {
  
  if (rawBlock.type === 'atomic') {
    const entity : common.RawEntity = entityMap[rawBlock.entityRanges[0].key];
    if (entity.type.endsWith('_begin') || entity.type.endsWith('_end')) {
      return (entity.type as common.EntityTypes);
    } 
  } 
  return null; 
}

function isParagraphBlock(block : common.RawContentBlock) : boolean {
  const { data, type } = block; 
  return (type === 'unstyled');
}

function isQuoteBlock(block : common.RawContentBlock) : boolean {
  const { data, type } = block; 
  return (type === 'blockquote');
}

function isFormulaBlock(block : common.RawContentBlock) : boolean {
  const { data, type } = block; 
  return (type === 'formula');
}

function isBasicCodeBlock(block : common.RawContentBlock) : boolean {
  const { data, type } = block; 
  return (type === 'code');
}

function isUnorderedListBlock(block : common.RawContentBlock) : boolean {
  const { type } = block; 
  return (type === 'unordered-list-item');
}

function isOrderedListBlock(block : common.RawContentBlock) : boolean {
  const { type } = block; 
  return (type === 'ordered-list-item');
}

function isCodeBlock(block : common.RawContentBlock, entityMap: common.RawEntityMap) : boolean {
  const { type } = block; 
  if (block.type === 'atomic') {
    const entity : common.RawEntity = entityMap[block.entityRanges[0].key];
    return entity.type === 'codeblock';
  } 
  return false; 
}

function isTable(block : common.RawContentBlock, entityMap: common.RawEntityMap) : boolean {
  const { type } = block; 
  if (block.type === 'atomic') {
    const entity : common.RawEntity = entityMap[block.entityRanges[0].key];
    return entity.type === 'table';
  } 
  return false; 
}

function isCustom(
  customType: string, 
  block : common.RawContentBlock, entityMap: common.RawEntityMap) : boolean {
  
  const { type } = block; 
  if (block.type === 'atomic') {
    const entity : common.RawEntity = entityMap[block.entityRanges[0].key];
    return entity.type === customType;
  } 
  return false; 
}

function isWbInline(block : common.RawContentBlock, entityMap: common.RawEntityMap) : boolean {
  const { type } = block; 
  if (block.type === 'atomic') {
    const entity : common.RawEntity = entityMap[block.entityRanges[0].key];
    return entity.type === 'wb_inline';
  } 
  return false; 
}

function translateList(
  listType : string, 
  rawBlock : common.RawContentBlock, 
  block: ContentBlock, iterator : BlockIterator, 
  entityMap : common.RawEntityMap, context: Stack) {

  // Create the object representing the list type (ol, ul)
  const list = {};
  list[listType] = { '#array': [] };
  const container = list[listType]['#array'];

  const listBlockType = rawBlock.type;

  top(context).push(list);

  let rb = rawBlock;
  let b = block;

  // To translate a list we have iterate through the blocks
  // to find the transition out of blocks of this list type.
  while (true) {

    if (rb.inlineStyleRanges.length === 0) {
      container.push({ li: { '#text': rb.text } });
    } else {
      const li = { li: { '#array': [] } };
      container.push(li);
      translateTextBlock(rb, b, entityMap, li.li['#array']);
    }

    let nextBlock = iterator.peek();
    if (nextBlock === null || nextBlock.block.type !== listBlockType) {
      break;
    }

    nextBlock = iterator.next();
    rb = nextBlock.rawBlock;
    b = nextBlock.block;
  }

}

function translateAtomic(
  type: string,
  rawBlock : common.RawContentBlock, 
  block: ContentBlock, entityMap : common.RawEntityMap, context: Stack) {

  const item = entityMap[rawBlock.entityRanges[0].key].data[type];
  top(context).push(item.toPersistence());
}


function translateUnsupported(
  rawBlock : common.RawContentBlock, 
  block: ContentBlock, entityMap : common.RawEntityMap, context: Stack) {

  top(context).push(entityMap[rawBlock.entityRanges[0].key].data);
}

function translateCodeBlock(
  rawBlock : common.RawContentBlock, 
  block: ContentBlock, entityMap : common.RawEntityMap, context: Stack) {

  const codeblock : CodeBlock = entityMap[rawBlock.entityRanges[0].key].data.codeblock;
  top(context).push(codeblock.toPersistence());
}

function translateTable(
  rawBlock : common.RawContentBlock, 
  block: ContentBlock, entityMap : common.RawEntityMap, context: Stack) {

  const table : Table = entityMap[rawBlock.entityRanges[0].key].data.table;
  top(context).push(table.toPersistence());
}

function translateWbInline(
  rawBlock : common.RawContentBlock, 
  block: ContentBlock, entityMap : common.RawEntityMap, context: Stack) {

  const wb : WbInline = entityMap[rawBlock.entityRanges[0].key].data.wbinline;
  top(context).push(wb.toPersistence());
}

function translateSection(
  iterator: BlockIterator, 
  rawBlock: common.RawContentBlock, 
  entityMap : common.RawEntityMap, context: Stack) {

  let block = iterator.peek();
  let title;
  if (block !== null 
    && block.rawBlock.type === 'atomic' 
    && entityMap[block.rawBlock.entityRanges[0].key].type === common.EntityTypes.title_begin) {
    
    // Move past the title start
    block = iterator.next();

    // Get the title
    block = iterator.next();

    // Process the title content
    title = processTitle(block.rawBlock, block.block, entityMap);

    block = iterator.peek();
    while (block !== null 
      && block.rawBlock.type === 'atomic' 
      && entityMap[block.rawBlock.entityRanges[0].key].type === common.EntityTypes.title_end) {

      block = iterator.next();
    }

  } else {
    title = {
      title: {
        '#text': '',
      },
    };
  }

  const s = { 
    section: {
      '@purpose': entityMap[rawBlock.entityRanges[0].key].data.purpose,
      '#array': [title, {
        body: {
          '#array': [],
        },
      }],
    },
  };

  top(context).push(s);
  context.push((s.section['#array'][1] as any).body['#array']);

}


function translatePullout(
  iterator: BlockIterator, 
  rawBlock: common.RawContentBlock, entityMap : common.RawEntityMap, context: Stack) {

  const arr = [];
  
  const p = {
    pullout: {
      '@type': entityMap[rawBlock.entityRanges[0].key].data.subType,
      '#array': arr,
    },
  };

  top(context).push(p);
  context.push(p.pullout['#array']);

}

function translateDefinition(
  iterator: BlockIterator, 
  rawBlock: common.RawContentBlock, entityMap : common.RawEntityMap, context: Stack) {

  const term = entityMap[rawBlock.entityRanges[0].key].data.term;
  const arr = [{
    term: {
      '#text': term,
    },
  }];

  const p = {
    definition: {
      '#array': arr,
    },
  };

  top(context).push(p);
  context.push(p.definition['#array']);

}

function translateTitle(
  iterator: BlockIterator, 
  rawBlock: common.RawContentBlock, entityMap : common.RawEntityMap, context: Stack) {

  const arr = [];

  const p = {
    title: {
      '#array': arr,
    },
  };

  top(context).push(p);
  context.push(p.title['#array']);

}

function translatePronunciation(
  iterator: BlockIterator, 
  rawBlock: common.RawContentBlock, entityMap : common.RawEntityMap, context: Stack) {

  const src = entityMap[rawBlock.entityRanges[0].key].data.type;
  const type = entityMap[rawBlock.entityRanges[0].key].data.srcType;
  
  const arr = [];

  const p = {
    pronunciation: {
      '@src': src,
      '@type': type,
      '#array': arr,
    },
  };

  top(context).push(p);
  context.push(p.pronunciation['#array']);

}

function translateTranslation(
  iterator: BlockIterator, 
  rawBlock: common.RawContentBlock, entityMap : common.RawEntityMap, context: Stack) {

  const arr = [];

  const p = {
    translation: {
      '#array': arr,
    },
  };

  top(context).push(p);
  context.push(p.translation['#array']);

}

function translateMaterial(
  iterator: BlockIterator, 
  rawBlock: common.RawContentBlock, entityMap : common.RawEntityMap, context: Stack) {

  const arr = [];

  const p = {
    material: {
      '#array': arr,
    },
  };

  top(context).push(p);
  context.push(p.material['#array']);

}

function translateMeaning(
  iterator: BlockIterator, 
  rawBlock: common.RawContentBlock, entityMap : common.RawEntityMap, context: Stack) {

  const arr = [];

  const p = {
    meaning: {
      '#array': arr,
    },
  };

  top(context).push(p);
  context.push(p.meaning['#array']);

}

function processTitle(
  rawBlock: common.RawContentBlock, block: ContentBlock, entityMap: common.RawEntityMap) {
  if (rawBlock.inlineStyleRanges.length === 0 && rawBlock.entityRanges.length === 0) {
    return { title: { '#text': rawBlock.text } };
  } else {
    const title = { title: { '#array': [] } };
    translateTextBlock(rawBlock, block, entityMap, title.title['#array']);
    return title;
  }
}

function translateExample(
  iterator: BlockIterator, 
  rawBlock: common.RawContentBlock, entityMap : common.RawEntityMap, context: Stack) {

  const arr = [];
  const e = {
    example: {
      '#array': arr,
    },
  };

  top(context).push(e);
  context.push(e.example['#array']);

}


function translateParagraph(
  rawBlock : common.RawContentBlock, 
  block: ContentBlock, entityMap : common.RawEntityMap, context: Stack) {

  if (rawBlock.inlineStyleRanges.length === 0 && rawBlock.entityRanges.length === 0) {
    top(context).push({ p: { '#text': rawBlock.text } });
  } else {
    const p = { p: { '#array': [] } };
    top(context).push(p);
    translateTextBlock(rawBlock, block, entityMap, p.p['#array']);
  }

}

function translateQuoteBlock(
  rawBlock : common.RawContentBlock, 
  block: ContentBlock, entityMap : common.RawEntityMap, context: Stack) {

  if (rawBlock.inlineStyleRanges.length === 0 && rawBlock.entityRanges.length === 0) {
    top(context).push({ quote: { '#text': rawBlock.text } });
  } else {
    const p = { quote: { '#array': [] } };
    top(context).push(p);
    translateTextBlock(rawBlock, block, entityMap, p.quote['#array']);
  }

}

function translateFormulaBlock(
  rawBlock : common.RawContentBlock, 
  block: ContentBlock, entityMap : common.RawEntityMap, context: Stack) {

  if (rawBlock.inlineStyleRanges.length === 0 && rawBlock.entityRanges.length === 0) {
    top(context).push({ formula: { '#text': rawBlock.text } });
  } else {
    const p = { formula: { '#array': [] } };
    top(context).push(p);
    translateTextBlock(rawBlock, block, entityMap, p.formula['#array']);
  }

}

function translateBasicCodeBlock(
  rawBlock : common.RawContentBlock, 
  block: ContentBlock, entityMap : common.RawEntityMap, context: Stack) {

  if (rawBlock.inlineStyleRanges.length === 0 && rawBlock.entityRanges.length === 0) {
    top(context).push({ code: { '#text': rawBlock.text } });
  } else {
    const p = { code: { '#array': [] } };
    top(context).push(p);
    translateTextBlock(rawBlock, block, entityMap, p.code['#array']);
  }

}

function combineIntervals(rawBlock: common.RawContentBlock) : InlineOrEntity[] {
  
  const intervals : InlineOrEntity[] = 
    [...rawBlock.entityRanges, ...rawBlock.inlineStyleRanges]
    .sort((a,b) => {
      if (a.offset - b.offset === 0) {
        return a.length - b.length;
      } else {
        return a.offset - b.offset;
      }
    });
  
  return intervals;
}

function hasOverlappingIntervals(intervals : InlineOrEntity[]) : boolean {
  
  for (let i = 0; i < intervals.length - 1; i += 1) {
    const a = intervals[i];
    const b = intervals[i + 1];

    if ((a.offset + a.length) > b.offset) {
      return true;
    }
  }
  return false;
}

function translateOverlappingGroup(
  offset: number,
  length: number, 
  ranges: InlineOrEntity[],
  rawBlock : common.RawContentBlock, 
  block: ContentBlock, entityMap : common.RawEntityMap) : Object[] {

  const container = [];

  // Walk through each group of overlapping styles 
  // and create the necessary objects, using the Draft per-character style support
  const chars : Immutable.List<CharacterMetadata> = block.getCharacterList();

  let current = chars.get(offset).getStyle();
  let begin = offset;

  // createStyleTree is a helper function to create the object tree of 
  // potentially nested styles for a specific range.  

  // set is an Immutable OrderedSet of style strings ('BOLD', 'ITALIC')
  // that represent the styles applied to the range of start-end. An example
  // of what it would create 

  // { sub: { var: "#text": "some text"}}
  const createStyleTree = (set, start, end) => {
    
    // A placeholder for the first style object
    const root = { root: {} };
    let last = root;

    set.toArray().forEach((s) => {
      
      // For each style, create the object representation for that style
      if (s !== undefined) {

        const style = Object.assign({}, styleContainers[s]());

        // Now root this style object into the parent style
        last[common.getKey(last)] = style;
        last = style; 
      }
    });

    // The '#text' parameter should only exist at the leaf node
    last[common.getKey(last)]['#text'] = rawBlock.text.substring(start, end);

    // Add the root of the object tree to the container
    container.push(root.root);
  };

  // Walk through each character at a time, finding when the
  // style set that applies to the character differ from the previous
  // character.  For these transitions we create a style tree and
  // push it into the container. 
  for (let i = offset; i < (offset + length); i += 1) {
    const c : CharacterMetadata = chars.get(i);
    const allStyles : Immutable.OrderedSet<string> = c.getStyle();

    if (!allStyles.equals(current)) {
      
      createStyleTree(current, begin, i);
      current = allStyles;
      begin = i;
    }
  }

  createStyleTree(current, begin, (offset + length));
    
  return container;
}

// Group all overlapping ranges 
function groupOverlappingRanges(ranges: InlineOrEntity[]) : OverlappingRanges[] {

  const groups : OverlappingRanges[] 
    = [{ offset: ranges[0].offset, length: ranges[0].length, ranges: [ranges[0]] }];
  
  for (let i = 1; i < ranges.length; i += 1) {
    const s = ranges[i];
    const g = groups[groups.length - 1];
    const endOffset = g.offset + g.length;
    if (s.offset < endOffset) {
      g.length = (s.offset + s.length) - g.offset;
      g.ranges.push(s);
    } else {
      groups.push({ offset: s.offset, length: s.length, ranges: [s] });
    }
  }

  return groups;
}

function isLinkRange(er: common.RawEntity) : boolean {
  
  switch (er.type) {
    case common.EntityTypes.activity_link:
    case common.EntityTypes.link:
    case common.EntityTypes.xref:
      return true;
    default: 
      return false;
  }
  
}

function getLinkRanges(
  rawBlock : common.RawContentBlock, entityMap : common.RawEntityMap) : common.RawEntityRange[] {
  return rawBlock.entityRanges.filter(er => isLinkRange(entityMap[er.key]));
}

// Does a completely subsume b?
function subsumes(a: InlineOrEntity, b: InlineOrEntity) : boolean {
  return b.offset >= a.offset && b.length <= a.length;
}

// Do a and b overlap in any way?
function overlaps(a: InlineOrEntity, b: InlineOrEntity) : boolean {
  if (a.offset < b.offset) {
    return a.offset + a.length > b.offset;
  } else {
    return b.offset + b.length > a.offset;
  }
}


// Splits styles that overlap the specified linkRange. For example, in the following
// The text "This is some" is bold and the text "some text" is the text for a link.
// This function would split the bold interval so that there would be two intervals,
// one for "This is " and another for "some".  This is necessary because the 
// persistence representation of links requires nesting of their text content, and
// so to do that property we need to make sure no other styles overlap the link

//          --link---
//  ----bold----
//  This is some text
function splitOverlappingStyles(
  linkRange: common.RawEntityRange, rawBlock: common.RawContentBlock) {

  const updatedInlines : common.RawInlineStyle[] = [];

  rawBlock.inlineStyleRanges.forEach((s) => {
    if (overlaps(linkRange, s)) {
      if (subsumes(linkRange, s)) {
        updatedInlines.push(s); // no need to split it as the range subsumes it
      } else {

        const sEndOffset = s.offset + s.length;
        const linkEndOffset = linkRange.offset + linkRange.length;

        if (linkRange.offset < s.offset) {
          updatedInlines.push(
            { offset: s.offset, length: linkEndOffset - s.offset, style: s.style });
          updatedInlines.push(
            { offset: linkEndOffset + 1, 
              length: sEndOffset - (linkEndOffset + 1), style: s.style });

        } else {

          updatedInlines.push(
            { offset: s.offset, length: linkRange.offset - s.offset, style: s.style });
           
          if (sEndOffset > linkEndOffset) {
            updatedInlines.push(
              { offset: linkRange.offset, length: linkRange.length, style: s.style });
            updatedInlines.push(
              { offset: linkRange.offset, length: linkRange.length, style: s.style });
          
          } else {
            updatedInlines.push(
              { offset: linkRange.offset, length: sEndOffset - linkRange.offset, style: s.style });
         
          }
        }
      }

    } else {
      updatedInlines.push(s);
    }
  });

  rawBlock.inlineStyleRanges = updatedInlines;
}

function processOverlappingStyles(
  group: OverlappingRanges, rawBlock : common.RawContentBlock, 
  block: ContentBlock, entityMap : common.RawEntityMap) : Object[] {

  const linkRanges = group.ranges
    .filter((range) => {
      if (isEntityRange(range)) {
        return isLinkRange(entityMap[range.key]);
      } else {
        return false;
      }
    });

  // We should only have at most one link range.
  if (linkRanges.length === 1) {
    if (group.ranges.length === 1) {

      // There is only one style, this one, so use the basic entity translator
      const text = rawBlock.text.substr(group.ranges[0].offset, group.ranges[0].length);
      const entity = translateInlineEntity(linkRanges[0] as common.RawEntityRange, text, entityMap);
      entity[common.getKey(entity)][common.ARRAY] = [{ '#text': text }];
      return [entity];
    
    } else {

      const text = rawBlock.text.substr(group.ranges[0].offset, group.ranges[0].length);
      const entity = translateInlineEntity(linkRanges[0] as common.RawEntityRange, text, entityMap);

      const minusLink = group.ranges.filter((range) => {
        if (isEntityRange(range)) {
          return !isLinkRange(entityMap[range.key]);
        } else {
          return true;
        }
      });

      entity[common.getKey(entity)][common.ARRAY] 
        = translateOverlappingGroup(group.offset, 
                                    group.length, minusLink, rawBlock, block, entityMap);
    
      return [entity];
    }

  } else if (group.ranges.length === 1) {
    
    const item : InlineOrEntity = group.ranges[0];
    return [translateInline(item, rawBlock.text, entityMap)];
    
  } else {

    return translateOverlappingGroup(
      group.offset, group.length, group.ranges, rawBlock, block, entityMap);
  }

}

function translateOverlapping(
  rawBlock : common.RawContentBlock, 
  block: ContentBlock, entityMap : common.RawEntityMap, container: Object[]) {

  // Find all entityRanges that are links - we are going to have to 
  // nest containing styles underneath the object that we create for the link 
  const linkRanges : common.RawEntityRange[] = getLinkRanges(rawBlock, entityMap);
  
  // For each link range, identify any overlapping styles and split them so that
  // no styles overlap these ranges (it is okay to have a style be entirely within
  // a link range
  linkRanges.forEach(lr => splitOverlappingStyles(lr, rawBlock));

  // Chunk the entity ranges and inline styles into separate groups - where
  // only intervals that overlap each other belong to the same group. A group
  // could very likely contain just one interval. 
  const groups = groupOverlappingRanges(combineIntervals(rawBlock));

  // Create a bare text tag for the first unstyled part, if one exists
  const styles = rawBlock.inlineStyleRanges;
  if (styles[0].offset !== 0) {
    const text = { '#text': rawBlock.text.substring(0, styles[0].offset) };
    container.push(text);
  }

  // Handle each group of overlapping styles:

  for (let i = 0; i < groups.length; i += 1) {
    const g = groups[i];

    // Process a group of overlapping styles and push the processed 
    // styles into our container
    processOverlappingStyles(g, rawBlock, block, entityMap)
      .forEach(processed => container.push(processed));

    // Insert another plain text style if there is a gap between
    // this grouping and the next one (or the end of the full text)
    const endOrNext = (i === groups.length - 1) ? rawBlock.text.length : groups[i + 1].offset;
    if (endOrNext > (g.offset + g.length)) {
      container.push({ '#text': rawBlock.text.substring((g.offset + g.length), endOrNext) });
    }
    
  }
}


function translateInline(
  s : InlineOrEntity, text : string, entityMap : common.RawEntityMap) : Object {
  
  if (isInlineStyle(s)) {
    return translateInlineStyle(s, text, entityMap);
  } else {
    const { offset, length } = s;
    const obj = translateInlineEntity(s, text, entityMap);

    const sub = text.substr(s.offset, s.length);

    const key = common.getKey(obj);

    if (key === '#math') {
      return obj;
    } else {
      obj[common.getKey(obj)][common.ARRAY] = [{ '#text': sub }];
    }

    return obj;
  }

}

function translateInlineStyle(
  s : common.RawInlineStyle, text : string, entityMap : common.RawEntityMap) {
  const { style, offset, length } = s;
  const substr = text.substr(offset, length);
  const mappedStyle = common.styleMap[style];

  if (common.emStyles[mappedStyle] !== undefined) {
    return { em: { '@style': mappedStyle, '#text': substr } };
  } else {
    const value = {};
    value[mappedStyle] = { '#text': substr };
    return value;
  }
}


function link(s : common.RawEntityRange, text : string, entityMap : common.RawEntityMap) {

  const { data } = entityMap[s.key];

  return data.link.toPersistence();
}

function activity_link(s : common.RawEntityRange, text : string, entityMap : common.RawEntityMap) {

  const { data } = entityMap[s.key];
  
  return data.activity_link.toPersistence();
  
}


function cite(s : common.RawEntityRange, text : string, entityMap : common.RawEntityMap) {

  const { data } = entityMap[s.key];
  
  return data.cite.toPersistence();
  
}

function xref(s : common.RawEntityRange, text : string, entityMap : common.RawEntityMap) {

  const { data } = entityMap[s.key];
  
  return data.xref.toPersistence();
}

function input_ref(s : common.RawEntityRange, text : string, entityMap : common.RawEntityMap) {

  const { data, type } = entityMap[s.key];

  const item = {};
  item[type] = data;
  
  return item;
}

function quote(s : common.RawEntityRange, text : string, entityMap : common.RawEntityMap) {

  const { data, type } = entityMap[s.key];

  const item = {};
  item[type] = data;
  
  return item;
}

function math(s : common.RawEntityRange, text : string, entityMap : common.RawEntityMap) {

  const { data } = entityMap[s.key];

  if (data['#cdata'] !== undefined) {
    return { 'm:math': { '#cdata': data['#cdata'] } };
  } else {
    return { '#math': data['#math'] };
  }
  
}

function translateInlineEntity(
  s : common.RawEntityRange, text : string, entityMap : common.RawEntityMap) {

  const { data, type } = entityMap[s.key];
  if (entityHandlers[type] !== undefined) {
    const obj = entityHandlers[type](s, text, entityMap);
    return obj;
  } else {
    return data;
  }
}

function isInlineStyle(range : InlineOrEntity) : range is common.RawInlineStyle {
  return (<common.RawInlineStyle>range).style !== undefined;
}

function isEntityRange(range : InlineOrEntity) : range is common.RawEntityRange {
  return (<common.RawEntityRange>range).key !== undefined;
}

function translateNonOverlapping(
  rawBlock : common.RawContentBlock, 
  block: ContentBlock, intervals : InlineOrEntity[],
  entityMap : common.RawEntityMap, container: Object[]) {

  if (intervals[0].offset !== 0) {
    container.push({ '#text': rawBlock.text.substring(0, intervals[0].offset) });
  }

  for (let i = 0; i < intervals.length; i += 1) {
    const s = intervals[i];

    // Translate the style to a style object
    const translated = translateInline(s, rawBlock.text, entityMap);
    container.push(translated);

    // Insert another plain text style if there is a gap between
    // this style and the next one
    const endOrNext = (i === intervals.length - 1) ? rawBlock.text.length : intervals[i + 1].offset;
    if (endOrNext > (s.offset + s.length)) {
      container.push({ '#text': rawBlock.text.substring((s.offset + s.length), endOrNext) });
    }
    
  }
    
}


function translateTextBlock(
  rawBlock : common.RawContentBlock, 
  block: ContentBlock, entityMap : common.RawEntityMap, container: Object[]) {
  
  const intervals = combineIntervals(rawBlock);

  if (hasOverlappingIntervals(intervals)) {
    console.log('has overlapping');
    translateOverlapping(rawBlock, block, entityMap, container);
  } else {
    console.log('does not have overlapping');
    translateNonOverlapping(rawBlock, block, intervals, entityMap, container);
  }
}


