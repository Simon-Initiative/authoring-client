import * as Immutable from 'immutable';

import { ContentState, CharacterMetadata, ContentBlock, EntityMap, convertToRaw, convertFromRaw} from 'draft-js';
import { HtmlContent } from '../../../../../data/contentTypes';
import * as types from './common';

// Translation routine from draft model to persistence model 

type Container = Object[];
type Stack = Container[];

type Block = {
  rawBlock: types.RawContentBlock,
  block : ContentBlock
}

interface BlockIterator {
  next() : Block;
  hasNext() : boolean;
  peek() : Block;
}

interface BlockProvider {
  blocks : types.RawContentBlock[];
  state : ContentState;
  index : number; 
}

class BlockProvider implements BlockIterator {

  constructor(blocks : types.RawContentBlock[], state: ContentState) {
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

function translate(content: types.RawDraft, state: ContentState) : Object {

  const root = { body: [], contentType: 'HtmlContent'};

  // The root section really isn't a section, it is just the top level
  // body element.  We consider this to be depth level 0 - so it matches
  // the index of the location in this 'stack'.  
  const context = [root.body];  

  const iterator = new BlockProvider(content.blocks, state);

  while (iterator.hasNext()) {
    translateBlock(iterator, content.entityMap, context);
  }

  return root;
}

function translateBlock(iterator : BlockIterator,
  entityMap : types.RawEntityMap, context: Stack) {
  
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


function isSectionTitleBlock(block : types.RawContentBlock) : boolean {
  const { type } = block; 
  return (types.blockStylesMap[type] !== undefined);
}

function isParagraphBlock(block : types.RawContentBlock) : boolean {
  const { data, type } = block; 
  return (data.oliType === undefined && type === 'unstyled');
}

function isUnorderedListBlock(block : types.RawContentBlock) : boolean {
  const { type } = block; 
  return (type === 'unordered-list-item');
}

function isOrderedListBlock(block : types.RawContentBlock) : boolean {
  const { type } = block; 
  return (type === 'ordered-list-item');
}

function translateList(listType : string, 
  rawBlock : types.RawContentBlock, 
  block: ContentBlock, iterator : BlockIterator, 
  entityMap : types.RawEntityMap, context: Stack) {

  const list = {};
  list[listType] = [];

  const listBlockType = rawBlock.type;

  top(context).push(list);

  while (true) {

    if (rawBlock.inlineStyleRanges.length === 0) {
      list[listType].push({ li: { text: rawBlock.text}});
    } else {
      const li = { li: []};
      list[listType].push(li);
      translateTextBlock(rawBlock, block, entityMap, li.li);
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

function translateUnsupported(rawBlock : types.RawContentBlock, 
  block: ContentBlock, entityMap : types.RawEntityMap, context: Stack) {

  top(context).push(JSON.parse(entityMap[rawBlock.entityRanges[0].key].data.src));
}

function translateSection(rawBlock : types.RawContentBlock, 
  block: ContentBlock, entityMap : types.RawEntityMap, context: Stack) {

  const s = { 
    section: [{ 
      title: {
        text: rawBlock.text
      }
    }, {
      body: []
    }]
  };

  // Everytime we encounter a section title we have to consider
  // whether the new section is a sub-section of the current section,
  // a sibling section, or a parent section. To account for this we
  // get the section depth from the block header type and then
  // adjust the section stack accordingly.

  const sectionDepth = types.blockStylesMap[rawBlock.type];

  while (context.length > sectionDepth) {
    context.pop();
  }

  top(context).push(s);
  context.push((s.section[1] as any).body);

}

function translateParagraph(rawBlock : types.RawContentBlock, 
  block: ContentBlock, entityMap : types.RawEntityMap, context: Stack) {

  if (rawBlock.inlineStyleRanges.length === 0) {
    top(context).push({ p: { text: rawBlock.text}});
  } else {
    const p = { p: []};
    top(context).push(p);
    translateTextBlock(rawBlock, block, entityMap, p.p);
  }

}

function hasOverlappingIntervals(intervals : types.RawInlineStyle[]) : boolean {
  
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

function translateOverlapping(rawBlock : types.RawContentBlock, 
  block: ContentBlock, entityMap : types.RawEntityMap, container: Object[]) {

  // Create a bare text tag for the first unstyled part, if one exists
  let styles = rawBlock.inlineStyleRanges;
  if (styles[0].offset !== 0) {
    container.push({ text: rawBlock.text.substring(0, styles[0].offset - 1)});
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

  
  // Walk through each group of overlapping styles (which could just be one style)
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
        container.push({ em: {text: rawBlock.text.substring(begin, i - 1)}});
        current = chars.get(i).getStyle();
        begin = i;
      }
    }
    container.push({ em: {text: rawBlock.text.substring(begin, (g.offset + g.length) - 1)}});
    
    if (j !== groups.length - 1) {
      if (g.offset + g.length < (groups[j + 1].offset)) {
        container.push({ text: rawBlock.text.substring(g.offset + g.length + 1, groups[j + 1].offset - 1)});
      }
    }

  };

  // Create a bare text tag for the last unstyled part, if one exists
  let lastStyleEnd = styles[styles.length - 1].offset + styles[styles.length - 1].length;
  if (lastStyleEnd < rawBlock.text.length) {
    container.push({ text: rawBlock.text.substring(lastStyleEnd + 1)});
  }
}

function translateNonOverlapping(rawBlock : types.RawContentBlock, 
  block: ContentBlock, entityMap : types.RawEntityMap, container: Object[]) {

  let styles = rawBlock.inlineStyleRanges;
  if (styles[0].offset !== 0) {
    container.push({ text: rawBlock.text.substring(0, styles[0].offset)});
  }

  styles
    .map(s => ({ em: {text: rawBlock.text.substring(s.offset, s.offset + s.length)}}))
    .forEach(s => container.push(s));

  let lastStyleEnd = styles[styles.length - 1].offset + styles[styles.length - 1].length;
  if (lastStyleEnd < rawBlock.text.length) {
    container.push({ text: rawBlock.text.substring(lastStyleEnd)});
  }
}


function translateTextBlock(rawBlock : types.RawContentBlock, 
  block: ContentBlock, entityMap : types.RawEntityMap, container: Object[]) {
  
  if (hasOverlappingIntervals(rawBlock.inlineStyleRanges)) {
    translateOverlapping(rawBlock, block, entityMap, container);
  } else {
    translateNonOverlapping(rawBlock, block, entityMap, container);
  }
}


