import * as Immutable from 'immutable';

import { ContentState, CharacterMetadata, ContentBlock, EntityMap, convertToRaw, convertFromRaw} from 'draft-js';
import { HtmlContent } from '../../../../../data/contentTypes';
import * as common from './common';
import { EntityTypes } from '../custom';

// Translation routine from draft model to persistence model 

type Container = Object[];
type Stack = Container[];
type InlineOrEntity = common.RawInlineStyle | common.RawEntityRange;

type Block = {
  rawBlock: common.RawContentBlock,
  block : ContentBlock
}

interface BlockIterator {
  next() : Block;
  hasNext() : boolean;
  peek() : Block;
}

interface BlockProvider {
  blocks : common.RawContentBlock[];
  state : ContentState;
  index : number; 
}

class BlockProvider implements BlockIterator {

  constructor(blocks : common.RawContentBlock[], state: ContentState) {
    this.blocks = blocks;
    this.state = state; 
    this.index = 0;
  }

  next() : Block {

    if (this.index === this.blocks.length) {
      return null;
    }

    const block = { 
      rawBlock: this.blocks[this.index], 
      block: this.state.getBlockForKey(this.blocks[this.index].key)
    };
    this.index++;
    return block;
  }

  peek() : Block {
    
    if (this.index === this.blocks.length) {
      return null;
    }
    
    const block = { 
      rawBlock: this.blocks[this.index], 
      block: this.state.getBlockForKey(this.blocks[this.index].key)
    };
    return block;
  }

  hasNext() : boolean {
    return this.index < this.blocks.length
  }
}


const top = (stack : Stack) => stack[stack.length - 1];

export function draftToHtmlContent(state: ContentState) : HtmlContent {

  const rawContent = convertToRaw(state);
  const translated = translate(rawContent, state);

  console.log('translated back:');
  console.log(translated);

  return new HtmlContent(translated as any);
}

function translate(content: common.RawDraft, state: ContentState) : Object {

  const root = { body: { '#array': []}, contentType: 'HtmlContent'};

  // The root section really isn't a section, it is just the top level
  // body element.  We consider this to be depth level 0 - so it matches
  // the index of the location in this 'stack'.  
  const context = [root.body['#array']];  

  const iterator = new BlockProvider(content.blocks, state);

  while (iterator.hasNext()) {
    translateBlock(iterator, content.entityMap, context);
  }

  return root;
}

function translateBlock(iterator : BlockIterator,
  entityMap : common.RawEntityMap, context: Stack) {
  
  const block = iterator.next();
  const rawBlock = block.rawBlock;
  const draftBlock = block.block;

  const sentinelType = getSentinelType(rawBlock, entityMap);

  if (sentinelType !== null) {
    handleSentinelTransition(sentinelType, iterator, rawBlock, entityMap, context);

  } else if (isParagraphBlock(rawBlock)) {
    translateParagraph(rawBlock, draftBlock, entityMap, context);
  } else if (isOrderedListBlock(rawBlock)) {
    translateList('ol', rawBlock, block, iterator, entityMap, context);
  } else if (isUnorderedListBlock(rawBlock)) {
    translateList('ul', rawBlock, block, iterator, entityMap, context);
  } else {
    translateUnsupported(rawBlock, draftBlock, entityMap, context);
  }
  
}

function handleSentinelTransition(type: EntityTypes, iterator: BlockIterator, 
  rawBlock: common.RawContentBlock, entityMap: common.RawEntityMap, context: Stack) {

    if (type.endsWith('_end')) {
      // Simply pop the context stack
      context.pop();

    } else if (type === EntityTypes.section_begin) {
      translateSection(iterator, entityMap, context);

    } else if (type === EntityTypes.pullout_begin) {
      translatePullout(iterator, entityMap, context);

    } else if (type === EntityTypes.example_begin) {
      translateExample(iterator, entityMap, context);

    } else if (type === EntityTypes.figure_begin) {
      //translateFigure(iterator, entityMap, context);

    } 

}

function getSentinelType(rawBlock: common.RawContentBlock, entityMap: common.RawEntityMap) : EntityTypes {
  if (rawBlock.type === 'atomic') {
    const entity : common.RawEntity = entityMap[rawBlock.entityRanges[0].key];
    if (entity.type.endsWith('_begin') || entity.type.endsWith('_end')) {
      return (entity.type as EntityTypes);
    } 
  } 
  return null; 
}

function isParagraphBlock(block : common.RawContentBlock) : boolean {
  const { data, type } = block; 
  return (type === 'unstyled');
}

function isUnorderedListBlock(block : common.RawContentBlock) : boolean {
  const { type } = block; 
  return (type === 'unordered-list-item');
}

function isOrderedListBlock(block : common.RawContentBlock) : boolean {
  const { type } = block; 
  return (type === 'ordered-list-item');
}

function translateList(listType : string, 
  rawBlock : common.RawContentBlock, 
  block: ContentBlock, iterator : BlockIterator, 
  entityMap : common.RawEntityMap, context: Stack) {

  const list = {};
  list[listType] = { '#array': [] };
  const container = list[listType]['#array'];

  const listBlockType = rawBlock.type;

  top(context).push(list);

  while (true) {

    if (rawBlock.inlineStyleRanges.length === 0) {
      container.push({ li: { '#text': rawBlock.text}});
    } else {
      const li = { li: { '#array': []}};
      container.push(li);
      translateTextBlock(rawBlock, block, entityMap, li.li['#array']);
    }

    let nextBlock = iterator.peek();
    if (nextBlock === null || nextBlock.block.type !== listBlockType) {
      break;
    }

    nextBlock = iterator.next();
    rawBlock = nextBlock.rawBlock;
    block = nextBlock.block;
  }

}

function translateUnsupported(rawBlock : common.RawContentBlock, 
  block: ContentBlock, entityMap : common.RawEntityMap, context: Stack) {

  top(context).push(entityMap[rawBlock.entityRanges[0].key].data);
}

function translateSection(iterator: BlockIterator, entityMap : common.RawEntityMap, context: Stack) {

  let block = iterator.peek();
  let title;
  if (block !== null && isTitleBlock(block.rawBlock)) {
    block = iterator.next();
    title = processTitle(block.rawBlock, block.block, entityMap);
  } else {
    title = {
      title: {
        '#text': ''
      }
    };
  }

  const s = { 
    section: {
      '#array': [title, {
        body: {
          '#array': []
        }
      }]
    }
  };

  top(context).push(s);
  context.push((s.section['#array'][1] as any).body['#array']);

}


function translatePullout(iterator: BlockIterator, entityMap : common.RawEntityMap, context: Stack) {

  let block = iterator.peek();
  let arr = [];
  if (block !== null && isTitleBlock(block.rawBlock)) {
    block = iterator.next();
    arr.push(processTitle(block.rawBlock, block.block, entityMap));
  }

  const p = {
    "pullout": {
      "@type": "note",
      "#array": arr
    }
  };

  top(context).push(p);
  context.push(p.pullout['#array']);

}

function processTitle(rawBlock: common.RawContentBlock, block: ContentBlock, entityMap: common.RawEntityMap) {
  if (rawBlock.inlineStyleRanges.length === 0 && rawBlock.entityRanges.length === 0) {
    return { title: { '#text': rawBlock.text}};
  } else {
    const title = { title: { '#array': []}};
    translateTextBlock(rawBlock, block, entityMap, title.title['#array']);
    return title;
  }
}

function translateExample(iterator: BlockIterator, entityMap : common.RawEntityMap, context: Stack) {

  let block = iterator.peek();
  let arr = [];
  if (block !== null && isTitleBlock(block.rawBlock)) {
    block = iterator.next();
    arr.push(processTitle(block.rawBlock, block.block, entityMap));
  }

  const e = {
    "example": {
      "@type": "note",
      "#array": arr
    }
  };

  top(context).push(e);
  context.push(e.example['#array']);

}

function isTitleBlock(block: common.RawContentBlock) {
  const data = block.data;
  return data.oliType !== undefined && data.oliType !== null && data.oliType === 'title';
}

function translateParagraph(rawBlock : common.RawContentBlock, 
  block: ContentBlock, entityMap : common.RawEntityMap, context: Stack) {

  if (rawBlock.inlineStyleRanges.length === 0 && rawBlock.entityRanges.length === 0) {
    top(context).push({ p: { '#text': rawBlock.text}});
  } else {
    const p = { p: { '#array': []}};
    top(context).push(p);
    translateTextBlock(rawBlock, block, entityMap, p.p['#array']);
  }

}

function combineIntervals(rawBlock: common.RawContentBlock) : InlineOrEntity[] {
  
  const intervals : InlineOrEntity[] = 
    [...rawBlock.entityRanges, ...rawBlock.inlineStyleRanges]
    .sort((a,b) => a.offset - b.offset);
  
  return intervals;
}

function hasOverlappingIntervals(intervals : InlineOrEntity[]) : boolean {
  
  for (let i = 0; i < intervals.length - 2; i++) {
    let a = intervals[i];
    let b = intervals[i + 1];

    if ((a.offset + a.length) > b.offset) {
      return true;
    }
  }
  return false;
}

function translateOverlapping(rawBlock : common.RawContentBlock, 
  block: ContentBlock, entityMap : common.RawEntityMap, container: Object[]) {

  // Create a bare text tag for the first unstyled part, if one exists
  let styles = rawBlock.inlineStyleRanges;
  if (styles[0].offset !== 0) {
    let text = { '#text': rawBlock.text.substring(0, styles[0].offset - 1)};
    container.push(text);
  }

  // Find all overlapping styles and group them
  let groups = [{ offset: styles[0].offset, length: styles[0].length}];
  let offset, length;
  
  for (let i = 1; i < styles.length; i++) {
    let s = styles[i];
    let g = groups[groups.length - 1];
    let endOffset = g.offset + g.length;
    if (s.offset < endOffset) {
      g.length = (s.offset + s.length) - g.offset;
    } else {
      groups.push({ offset: s.offset, length: s.length });
    }
  }

  
  // Walk through each group of overlapping styles 
  // and create the necessary objects, using the Draft per-character style support
  let chars : Immutable.List<CharacterMetadata> = block.getCharacterList();

  for (let j = 0; j < groups.length; j++) {

    let g = groups[j];

    let current = chars.get(g.offset).getStyle();
    let begin = g.offset;

    for (let i = g.offset; i < (g.offset + g.length); i++) {
      let c : CharacterMetadata = chars.get(i);
      let allStyles : Immutable.OrderedSet<string> = c.getStyle();

      if (!allStyles.equals(current)) {
        
        // TODO handle multiple styles 

        container.push({ em: {'#text': rawBlock.text.substring(begin, i - 1)}});
        current = chars.get(i).getStyle();
        begin = i;
      }
    }
    // Handle the last interval in the group
    container.push({ em: {'#text': rawBlock.text.substring(begin, (g.offset + g.length) - 1)}});
    
    // Handle the gap between groups (which is just a bare text tag)
    if (j !== groups.length - 1) {
      if (g.offset + g.length < (groups[j + 1].offset)) {
        container.push({ '#text': rawBlock.text.substring(g.offset + g.length + 1, groups[j + 1].offset - 1)});
      }
    }

  };

  // Create a bare text tag for the last unstyled part, if one exists
  let lastStyleEnd = styles[styles.length - 1].offset + styles[styles.length - 1].length;
  if (lastStyleEnd < rawBlock.text.length) {
    container.push({ '#text': rawBlock.text.substring(lastStyleEnd + 1)});
    
  }
}

function translateInline(s : InlineOrEntity, text : string, entityMap : common.RawEntityMap) {
  
  if (isInlineStyle(s)) {
    const { style, offset, length } = s;
    const substr = text.substring(offset, offset + length);
    const mappedStyle = common.styleMap[style];

    if (common.emStyles[mappedStyle] !== undefined) {
      return { em: { '@style': mappedStyle, '#text': substr}};
    } else {
      const value = {};
      value[mappedStyle] = { '#text': substr};
      return value;
    }
  } else {
    return entityMap[s.key].data;
  }

}

function isInlineStyle(range : InlineOrEntity) : range is common.RawInlineStyle {
  return (<common.RawInlineStyle>range).style !== undefined;
}

function translateNonOverlapping(rawBlock : common.RawContentBlock, 
  block: ContentBlock, intervals : InlineOrEntity[],
  entityMap : common.RawEntityMap, container: Object[]) {

  if (intervals[0].offset !== 0) {
    container.push({ '#text': rawBlock.text.substring(0, intervals[0].offset)});
  }

  for (let i = 0; i < intervals.length; i++) {
    const s = intervals[i];

    // Translate the style to a style object
    const translated = translateInline(s, rawBlock.text, entityMap)
    container.push(translated);

    // Insert another plain text style if there is a gap between
    // this style and the next one
    let endOrNext = (i == intervals.length - 1) ? rawBlock.text.length : intervals[i + 1].offset;
    if (endOrNext > (s.offset + s.length)) {
      container.push({ '#text': rawBlock.text.substring((s.offset + s.length), endOrNext)});
    }
    
  }
    
}


function translateTextBlock(rawBlock : common.RawContentBlock, 
  block: ContentBlock, entityMap : common.RawEntityMap, container: Object[]) {
  
  const intervals = combineIntervals(rawBlock);

  if (hasOverlappingIntervals(intervals)) {
    translateOverlapping(rawBlock, block, entityMap, container);
  } else {
    translateNonOverlapping(rawBlock, block, intervals, entityMap, container);
  }
}


