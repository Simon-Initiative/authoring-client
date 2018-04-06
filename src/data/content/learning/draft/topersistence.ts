import * as Immutable from 'immutable';

import {
  CharacterMetadata, ContentBlock, ContentState, convertToRaw,
} from 'draft-js';

import guid from 'utils/guid';
import * as common from '../common';
import { BlockIterator, BlockProvider } from './provider';

// Translation routine from draft model to persistence model


// A mapping of inline sytles to the persistence
// object trees needed to represent them.  Functions
// are present here to provide a poor-man's immutability.
const styleContainers = {
  BOLD: () => ({ em: { '@style': 'bold' } }),
  ITALIC: () => ({ em: { '@style': 'italic' } }),
  DEEMPHASIS: () => ({ em: { '@style': 'deemphasis' } }),
  HIGHLIGHT: () => ({ em: { '@style': 'highlight' } }),
  STRIKETHROUGH: () => ({ em: { '@style': 'line-through' } }),
  OBLIQUE: () => ({ em: { '@style': 'oblique' } }),
  VAR: () => ({ var: { } }),
  TERM: () => ({ term: { } }),
  IPA: () => ({ ipa: { } }),
  FOREIGN: () => ({ foreign: { } }),
  SUBSCRIPT: () => ({ sub: { } }),
  SUPERSCRIPT: () => ({ sup: { } }),
};

const inlineTerminalTags = {};
inlineTerminalTags['m:math'] = true;
inlineTerminalTags['#math'] = true;
inlineTerminalTags['input_ref'] = true;
inlineTerminalTags['image'] = true;


type Container = Object[];
type Stack = Container[];

type InlineOrEntity = common.RawInlineStyle | common.RawEntityRange;

type OverlappingRanges = {
  offset: number,
  length: number,
  ranges: InlineOrEntity[],
};

const entityHandlers = {
  activity_link,
  xref,
  link,
  LINK: pastedLink,
  IMAGE: pastedImage,
  image: inlineImage,
  math,
  input_ref,
  cite,
  quote,
  code,
  formula_begin,
  formula_end,
};

// Converts the draft ContentState object to the HtmlContent format
// (which ultimately is serialized and stored in persistence)
export function fromDraft(state: ContentState, inlineText = false) : Object {

  const rawContent = convertToRaw(state);
  return translate(rawContent, state, inlineText);
}

function translate(content: common.RawDraft, state: ContentState, inlineText: boolean) : Object {

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

  if (inlineText) {

    const arr = root.body['#array'];
    const p = arr.find(e => common.getKey(e) === 'p');

    if (p !== undefined) {
      if (p.p['#text'] !== undefined) {
        delete p.p['@id'];
        delete p.p['@title'];
        return [p.p];
      }
      if (p.p['#array'] !== undefined) {
        return p.p['#array'];
      }
    } else {
      return root.body['#array'];
    }

  } else {
    return root.body['#array'];
  }

}

function translateBlock(
  iterator : BlockIterator,
  entityMap : common.RawEntityMap, context: Stack) {

  const block = iterator.next();
  const rawBlock = block.rawBlock;
  const draftBlock = block.block;

  if (isParagraphBlock(rawBlock)) {

    // If the last block is an empty paragraph, do not translate it
    if (rawBlock.text === ' ' && iterator.peek() === null) {
      return;
    }

    translateParagraph(rawBlock, draftBlock, entityMap, context);

  } else {
    translateUnsupported(rawBlock, draftBlock, entityMap, context);
  }

}

const top = (stack : Stack) => {
  const s = stack[stack.length - 1];
  return {
    push: (o) => {
      if (s !== undefined) {
        s.push(o);
      }
    },
  };

};

function isParagraphBlock(block : common.RawContentBlock) : boolean {
  const { type } = block;
  return (type === 'unstyled');
}


function translateUnsupported(
  rawBlock : common.RawContentBlock,
  block: ContentBlock, entityMap : common.RawEntityMap, context: Stack) {

  top(context).push(entityMap[rawBlock.entityRanges[0].key].data);
}

function translateParagraph(
  rawBlock : common.RawContentBlock,
  block: ContentBlock, entityMap : common.RawEntityMap, context: Stack) {

  const id = extractId(rawBlock);
  const title = extractTitle(rawBlock);

  if (rawBlock.inlineStyleRanges.length === 0 && rawBlock.entityRanges.length === 0) {
    top(context).push({ p: { '#text': rawBlock.text, '@id': id, '@title': title } });
  } else {
    const p = { p: { '#array': [], '@id': id, '@title': title } };
    top(context).push(p);
    translateTextBlock(rawBlock, block, entityMap, p.p['#array']);
  }
}

function extractId(rawBlock : common.RawContentBlock) {
  if (rawBlock.data === undefined || rawBlock.data.id === undefined) {
    return 'a' + guid();
  }

  return rawBlock.data.id;
}
function extractTitle(rawBlock : common.RawContentBlock) {
  if (rawBlock.data === undefined || rawBlock.data.title === undefined) {
    return '';
  }

  return rawBlock.data.title;
}

function combineIntervals(rawBlock: common.RawContentBlock) : InlineOrEntity[] {

  const intervals : InlineOrEntity[] =
    [...rawBlock.entityRanges, ...rawBlock.inlineStyleRanges]
    .sort((a,b) => {
      if (a.offset - b.offset === 0) {
        return a.length - b.length;
      }

      return a.offset - b.offset;
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
        const container = styleContainers[s];
        let style;
        if (container === undefined) {
          style = Object.assign({}, styleContainers.BOLD());
        } else {
          style = Object.assign({}, container());
        }

        // Now root this style object into the parent style
        const key = common.getKey(last);
        last[key][common.getKey(style)] = style[common.getKey(style)];
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

  createStyleTree(
    chars.get(offset + length - 1).getStyle(),
    begin, (offset + length));

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
      g.length = Math.max((s.offset + s.length) - g.offset, g.length);
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
    case common.EntityTypes.quote:
    case common.EntityTypes.cite:
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
  }

  return b.offset + b.length > a.offset;
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
              { offset: linkRange.offset + linkRange.length,
                length: sEndOffset - (linkEndOffset), style: s.style });

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
      }

      return false;
    });

  // We should only have at most one link range.
  if (linkRanges.length === 1) {
    if (group.ranges.length === 1) {

      // There is only one style, this one, so use the basic entity translator
      const text = rawBlock.text.substr(group.ranges[0].offset, group.ranges[0].length);
      const entity = translateInlineEntity(linkRanges[0] as common.RawEntityRange, text, entityMap);
      entity[common.getKey(entity)][common.ARRAY] = [{ '#text': text }];
      return [entity];

    }

    const text = rawBlock.text.substr(group.ranges[0].offset, group.ranges[0].length);
    const entity = translateInlineEntity(linkRanges[0] as common.RawEntityRange, text, entityMap);

    const minusLink = group.ranges.filter((range) => {
      if (isEntityRange(range)) {
        return !isLinkRange(entityMap[range.key]);
      }

      return true;
    });

    entity[common.getKey(entity)][common.ARRAY]
      = translateOverlappingGroup(group.offset,
                                  group.length, minusLink, rawBlock, block, entityMap);

    return [entity];

  }
  if (group.ranges.length === 1) {

    const item : InlineOrEntity = group.ranges[0];
    return [translateInline(item, rawBlock.text, entityMap)];

  }

  return translateOverlappingGroup(
    group.offset, group.length, group.ranges, rawBlock, block, entityMap);
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
  if (groups[0].offset !== 0) {
    const text = { '#text': rawBlock.text.substring(0, groups[0].offset) };
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
  }

  const obj = translateInlineEntity(s, text, entityMap);

  const sub = text.substr(s.offset, s.length);

  const key = common.getKey(obj);

  if (inlineTerminalTags[key]) {
    return obj;
  }

  if (obj[common.getKey(obj)][common.ARRAY] === undefined) {
    obj[common.getKey(obj)][common.ARRAY] = [{ '#text': sub }];
  }

  return obj;
}

function translateInlineStyle(
  s : common.RawInlineStyle, text : string, entityMap : common.RawEntityMap) {
  const { style, offset, length } = s;
  const substr = text.substr(offset, length);
  const mappedStyle = common.styleMap[style];

  if (common.emStyles[mappedStyle] !== undefined) {
    return { em: { '@style': mappedStyle, '#text': substr } };
  }
  if (mappedStyle !== undefined && mappedStyle !== null) {

    const value = {};
    value[mappedStyle] = { '#text': substr };
    return value;

  }

  return { em: { '@style': 'bold', '#text': substr } };
}

function pastedLink(s : common.RawEntityRange, text : string, entityMap : common.RawEntityMap) {

  const { data } = entityMap[s.key];

  return {
    link: {
      '@href': data.href,
    },
  };
}

function pastedImage(s : common.RawEntityRange, text : string, entityMap : common.RawEntityMap) {

  const { data } = entityMap[s.key];

  return {
    image: {
      '@src': data.src,
      '#array': [],
    },
  };
}


function link(s : common.RawEntityRange, text : string, entityMap : common.RawEntityMap) {
  const { data } = entityMap[s.key];
  return data.toPersistence(fromDraft);
}

function formula_begin(s : common.RawEntityRange, text : string, entityMap : common.RawEntityMap) {
  return { formula: { '#array': [] } };
}

function formula_end(s : common.RawEntityRange, text : string, entityMap : common.RawEntityMap) {
  return { formula_end: {} };
}

function inlineImage(s : common.RawEntityRange, text : string, entityMap : common.RawEntityMap) {

  const { data } = entityMap[s.key];

  return data.toPersistence(fromDraft);
}

function activity_link(s : common.RawEntityRange, text : string, entityMap : common.RawEntityMap) {

  const { data } = entityMap[s.key];

  return data.toPersistence(fromDraft);

}


function cite(s : common.RawEntityRange, text : string, entityMap : common.RawEntityMap) {

  const { data } = entityMap[s.key];

  return data.toPersistence(fromDraft);

}

function xref(s : common.RawEntityRange, text : string, entityMap : common.RawEntityMap) {

  const { data } = entityMap[s.key];

  return data.toPersistence(fromDraft);
}

function input_ref(s : common.RawEntityRange, text : string, entityMap : common.RawEntityMap) {

  const { data, type } = entityMap[s.key];

  const item = {};
  item[type] = Object.assign({}, data);

  if (item[type]['#array'] !== undefined) {
    delete item[type]['#array'];
  }
  if (item[type]['$type'] !== undefined) {
    delete item[type]['$type'];
  }

  return item;
}

function quote(s : common.RawEntityRange, text : string, entityMap : common.RawEntityMap) {

  const { data } = entityMap[s.key];
  return data.toPersistence();
}


function code(s : common.RawEntityRange, text : string, entityMap : common.RawEntityMap) {

  const { data } = entityMap[s.key];
  return data.toPersistence();
}


function math(s : common.RawEntityRange, text : string, entityMap : common.RawEntityMap) {

  const { data } = entityMap[s.key];
  return data.toPersistence();
}

function translateInlineEntity(
  s : common.RawEntityRange, text : string, entityMap : common.RawEntityMap) {

  const { data, type } = entityMap[s.key];
  if (entityHandlers[type] !== undefined) {
    const obj = entityHandlers[type](s, text, entityMap);
    return obj;
  }

  return data;
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
    translateOverlapping(rawBlock, block, entityMap, container);
  } else {
    translateNonOverlapping(rawBlock, block, intervals, entityMap, container);
  }
}


