import * as Immutable from 'immutable';

import { ContentState, CharacterMetadata, ContentBlock, EntityMap, convertToRaw, convertFromRaw} from 'draft-js';
import { HtmlContent } from '../../../../../data/contentTypes';
import * as common from './common';

// Translation routine from draft model to persistence model 

type Container = Object[];
type Stack = Container[];

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

  if (isSectionTitleBlock(rawBlock)) {
    translateSection(rawBlock, draftBlock, entityMap, context);
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


function isSectionTitleBlock(block : common.RawContentBlock) : boolean {
  const { type } = block; 
  return (common.blockStylesMap[type] !== undefined);
}

function isParagraphBlock(block : common.RawContentBlock) : boolean {
  const { data, type } = block; 
  return (data.oliType === undefined && type === 'unstyled');
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

  top(context).push(JSON.parse(entityMap[rawBlock.entityRanges[0].key].data.src));
}

function translateSection(rawBlock : common.RawContentBlock, 
  block: ContentBlock, entityMap : common.RawEntityMap, context: Stack) {

  const s = { 
    section: {
      '#array': [{
        title: {
          '#text': rawBlock.text
        }
      }, {
        body: {
          '#array': []
        }
      }]
    }
  };

  // Everytime we encounter a section title we have to consider
  // whether the new section is a sub-section of the current section,
  // a sibling section, or a parent section. To account for this we
  // get the section depth from the block header type and then
  // adjust the section stack accordingly.

  const sectionDepth = common.blockStylesMap[rawBlock.type];

  while (context.length > sectionDepth) {
    context.pop();
  }

  top(context).push(s);
  context.push((s.section['#array'][1] as any).body['#array']);

}

function translateParagraph(rawBlock : common.RawContentBlock, 
  block: ContentBlock, entityMap : common.RawEntityMap, context: Stack) {

  if (rawBlock.inlineStyleRanges.length === 0) {
    top(context).push({ p: { '#text': rawBlock.text}});
  } else {
    const p = { p: { '#array': []}};
    top(context).push(p);
    translateTextBlock(rawBlock, block, entityMap, p.p['#array']);
  }

}

function hasOverlappingIntervals(intervals : common.RawInlineStyle[]) : boolean {
  
  intervals.sort((a,b) => a.offset - b.offset);
  
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

function translateInline(s : common.RawInlineStyle, text : string) {
  
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

}

function translateNonOverlapping(rawBlock : common.RawContentBlock, 
  block: ContentBlock, entityMap : common.RawEntityMap, container: Object[]) {

  let styles = rawBlock.inlineStyleRanges;
  if (styles[0].offset !== 0) {
    container.push({ '#text': rawBlock.text.substring(0, styles[0].offset)});
  }

  styles
    .map(s => translateInline(s, rawBlock.text))
    .forEach(s => container.push(s));

  let lastStyleEnd = styles[styles.length - 1].offset + styles[styles.length - 1].length;
  if (lastStyleEnd < rawBlock.text.length) {
    container.push({ '#text': rawBlock.text.substring(lastStyleEnd)});
  }
}


function translateTextBlock(rawBlock : common.RawContentBlock, 
  block: ContentBlock, entityMap : common.RawEntityMap, container: Object[]) {
  
  if (hasOverlappingIntervals(rawBlock.inlineStyleRanges)) {
    translateOverlapping(rawBlock, block, entityMap, container);
  } else {
    translateNonOverlapping(rawBlock, block, entityMap, container);
  }
}


