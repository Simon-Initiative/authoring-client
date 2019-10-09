import guid from 'utils/guid';
import { Section } from 'data/content/workbook/section';
import { Title, CellData, Image } from 'data/contentTypes';
import * as Immutable from 'immutable';
import { ContentElements, BODY_ELEMENTS, INLINE_ELEMENTS, FLOW_ELEMENTS } from 'data/content/common/elements';
import { WB_BODY_EXTENSIONS } from 'data/content/workbook/types';
import { Li } from 'data/content/learning/li';
import { Table } from 'data/content/learning/table';
import { Row } from 'data/content/learning/row';
import { WbInline } from 'data/content/workbook/wbinline';
import { Maybe } from 'tsmonad';
import { Activity } from 'data/content/workbook/activity';
import { YouTube } from 'data/content/learning/youtube';
import { Caption } from 'data/content/learning/caption';
import { Ol } from 'data/content/learning/ol';
import { Ul } from 'data/content/learning/ul';

export interface Context {
  id: string;
  title: string;
  lines: any[];
  objrefs: any[];
  bib: any[];
  inlines: any[];
  lists: any[];
  imagesToFetch: any[];
  activeListItems: any[];
  errors: any[];
}

const WB_ELEMENTS = [...BODY_ELEMENTS, ...WB_BODY_EXTENSIONS];

export function processPage(data): Context {

  const parts = data.title.split(':');
  const id = data.title.indexOf(':') !== -1 ? parts[0] : guid();
  const title = data.title.indexOf(':') !== -1 ? parts[1] : data.title;
  const context = parseBody(id, data);
  context.title = title;

  return context;
}

function parseBody(id, data): Context {

  const context: Context = {
    id,
    title: '',
    lines: [],
    objrefs: [],
    bib: [],
    inlines: data.inlineObjects,
    lists: data.lists,
    imagesToFetch: [],
    activeListItems: [],
    errors: [],
  };

  try {
    data.body.content.forEach(content => processContent(context, content));
  } catch (e) {
    context.errors.push(e);
  }

  return context;
}

function processContent(context: Context, c) {

  const addLine = addLineWithContext(context);

  if (!isListItem(c) && hasActiveList(context)) {
    addLine(list(context));
    context.activeListItems = [];
  }

  if (isSectionBreak(c)) {
    // Do nothing - section breaks are empty Google Docs content that have no
    // mapping to OLI content

  } else if (isHeading(c)) {
    addLine(section(c.paragraph));

  } else if (isImage(c) && !isListItem(c)) {
    addLine(imageWithContext(context, inlineIdFromContent(c)));

  } else if (isListItem(c)) {
    context.activeListItems.push(c);

  } else if (isParagraph(c)) {
    addLine(extractParagraph(context, c.paragraph));

  } else if (isTable(c)) {
    const customElement = extractCustomElementName(c.table);
    if (isGenericTable(customElement)) {
      addLine(table(context, c.table));

    } else if (isFormative(customElement)) {
      addLine(formative(context, c.table));

    } else if (isYoutube(customElement)) {
      addLine(youtube(context, c.table));

    } else if (isSummative(customElement)) {
      addLine(summative(context, c.table));

    } else if (isObjectives(customElement)) {
      context.objrefs = objectives(context, c.table);
    }

  } else {
    context.errors.push(`Unknown element could not be imported: ${JSON.stringify(c)}`);
  }
}

// Constructors

function paragraphDto(nodes: any[]) {
  return { p: { '#array': [...nodes] } };
}

function textDto(text: string) {
  return { '#text': text };
}

function linkDto(textNode: any, href: string) {
  return {
    link: {
      '@title': '',
      '@href': href,
      '@target': 'new',
      '@internal': false,
      '#array': [{ ...textNode }],
    },
  };
}

function boldDto(textNode: any) {
  return { em: { ...textNode } };
}

function italicDto(textNode: any) {
  return { em: { '@style': 'italic', ...textNode } };
}

function superscriptDto(textNode: any) {
  return { sup: { ...textNode } };
}

function subscriptDto(textNode: any) {
  return { sub: { ...textNode } };
}

function citeDto(ref: string) {
  return { cite: { entry: toId(ref) } };
}

function section(p) {
  return new Section().with({ title: Title.fromText(simpleText(p)) });
}

function table(context, t) {
  return new Table().with({
    rows: Immutable.OrderedMap(
      t.tableRows.map((r) => {
        const row = new Row().with({
          cells: Immutable.OrderedMap(
            r.tableCells.map((c) => {
              const cell = new CellData().with({
                colspan: c.tableCellStyle.columnSpan,
                rowspan: c.tableCellStyle.rowSpan,
                content: processNested(context, c.content),
              });
              return [cell.guid, cell];
            })),
        });
        return [row.guid, row];
      })),
  });
}

function formative(context: Context, t) {
  const params = tableGetKeyValues(context, t, ['idref', 'purpose']);
  return new WbInline().with({
    idref: params.idref,
    purpose: Maybe.maybe(params.purpose),
  });
}

function summative(context: Context, c) {
  const params = tableGetKeyValues(context, c, ['idref', 'purpose']);
  return new Activity().with({
    idref: params.idref,
    purpose: Maybe.maybe(params.purpose),
  });
}

function youtube(context: Context, c) {
  const { caption, id, height, width, src } =
    tableGetKeyValues(context, c, ['id', 'src', 'caption:s', 'height', 'width']);

  return new YouTube({
    id,
    height,
    width,
    src,
    caption: caption
      ? new Caption({ content: ContentElements.fromText(caption, guid(), INLINE_ELEMENTS) })
      : new Caption(),
  });
}

function list(context: Context): Ul | Ol {
  const listId = c => c.paragraph.bullet.listId;
  const level = c => c.paragraph.bullet.nestingLevel || 0;
  const isOrdered = c => context.lists[listId(c)].listProperties
    .nestingLevels[level(c)].glyphSymbol === undefined;
  const isDeeper = (one, two) => one > two;
  const isSameLevel = (one, two) => one === two;
  const makeList = item => isOrdered(item) ? new Ol() : new Ul();

  let li: Li;
  let remaining = context.activeListItems;
  const outerList = makeList(context.activeListItems[0]);

  function go(list: Ol | Ul, nestingLevel: number): Ul | Ol {
    const item = remaining[0];

    // Base case - no more elements
    if (!item) {
      return list;
    }

    // 1. Element is deeper, make new sub-list
    if (isDeeper(level(item), nestingLevel)) {
      const nestedList = go(makeList(item), level(item));
      li = new Li({
        content: new ContentElements({
          supportedElements: Immutable.List(FLOW_ELEMENTS),
          content: Immutable.OrderedMap([[nestedList.guid, nestedList]]),
        }),
      });

      return go(
        list.with({ listItems: list.listItems.set(li.guid, li) }),
        nestingLevel);
    }

    // 2. Element at same level, add it
    if (isSameLevel(level(item), nestingLevel)) {
      li = new Li({
        content: extractParagraph(context, item.paragraph, FLOW_ELEMENTS),
      });
      remaining = remaining.slice(1);

      return go(
        list.with({ listItems: list.listItems.set(li.guid, li) }),
        nestingLevel);
    }

    // 3. Element is shallower, it will be picked up by outer calls
    return list;
  }

  return go(outerList, 0);
}


// Helpers

function toId(id: string) {
  return id.replace(/\./g, '-');
}

function addLineWithContext(context: Context) {
  return function (content) {
    context.lines.push(content);
  };
}

function processNested(context: Context, nested, supportedElements = WB_ELEMENTS): ContentElements {
  let content = new ContentElements({
    supportedElements: Immutable.List(supportedElements),
  });
  nested.forEach((item) => {
    if (isImage(item)) {
      const image = imageWithContext(context, inlineIdFromContent(item));
      content = content.with({
        content: content.content.concat([[image.guid, image]]).toOrderedMap(),
      });
      return;
    }
    content = content.with({
      content: content.content.concat(
        extractParagraph(context, item.paragraph).content).toOrderedMap(),
    });
  });
  return content;
}

function inlineIdFromContent(c): string {
  return c.paragraph.elements.find(e => e.inlineObjectElement)
    .inlineObjectElement.inlineObjectId;
}

function inlineIdFromElement(e): string {
  return e.inlineObjectElement.inlineObjectId;
}

function imageWithContext(context: Context, id: string, isInline = false): Image {

  if (id && context.inlines[id] !== undefined) {

    const inline = context.inlines[id];

    if (hasImageProperties(inline)) {

      const obj = inline.inlineObjectProperties.embeddedObject;

      const href = obj.imageProperties.contentUri;
      const height = Math.round(+obj.size.height.magnitude);
      const width = Math.round(+obj.size.width.magnitude);
      const name = 'image-' + context.id + '-' + (context.imagesToFetch.length + 1) + '.png';
      const path = `../webcontent/${name}`;

      context.imagesToFetch.push({
        href,
        name,
        path,
      });
      const image = new Image({
        src: path,
        height: String(height),
        width: String(width),
      });
      if (isInline) {
        return image.with({
          style: 'inline',
        });
      }
      return image;
    }
  }
}

function objectives(context: Context, c) {
  const { ids } = tableGetKeyValues(context, c, ['ids']);
  return parseObjectives(ids);
}

function parseObjectives(objList: string) {
  return objList.split(',').map(o => o.trim());
}

function extractCustomElementName(t): string | null {

  const text = (cell) => {
    if (cell.content.length === 1 && cell.content[0].paragraph) {
      const p = cell.content[0].paragraph;
      if (p.elements.length > 0) {
        if (p.elements[0].textRun && p.elements[0].textRun.content) {
          return p.elements[0].textRun.content.trim();
        }
      }
    }
    return '';
  };

  const row = t.tableRows[0];
  if (row.tableCells.length > 1) {
    const first = text(row.tableCells[0]);

    if (first.trim() === 'CustomElement') {
      return text(row.tableCells[1]);
    }
  }
  return null;
}

function tableGetKeyValues(context: Context, table, keys): any {

  const k = keys.reduce((p, c) => {
    if (c.endsWith(':s')) {
      p[c.substr(0, c.length - 2)] = () => structuredText.bind(undefined, context);
    } else {
      p[c] = getBasicText;
    }
    return p;
  }, {});

  const o = {};

  table.tableRows.forEach((r, ri) => {
    const key = getTableText(table, getBasicText, ri, 0);
    const processor = k[key];
    if (processor !== undefined) {
      const value = getTableText(table, processor, ri, 1);
      o[key] = value;
    }
  });

  return o;
}

function getTableText(table, processor, row, col) {
  if (table.tableRows.length > row) {
    const r = table.tableRows[row];
    if (r.tableCells.length > col) {
      const c = r.tableCells[col];
      return processor(c);
    }
  }
  return null;
}

// Works for both google docs elements and content items (which contain elements)
function extractParagraph(context: Context, p, supportedElements = WB_ELEMENTS): ContentElements {
  const lines = [];

  // content items
  if (p.elements) {
    p.elements.forEach(parseElement);

    // individual element
  } else {
    parseElement(p);
  }

  return ContentElements.fromPersistence(
    paragraphDto(lines), guid(), supportedElements, null, () => { });

  function parseElement(e) {
    if (isText(e)) {
      const { textStyle } = e.textRun;
      let { content } = e.textRun;

      // Do not persist empty paragraphs. OLI paragraph spacing is different from Google Docs
      if (content === '\n') {
        return;
      }

      if (content.endsWith('\n')) {
        content = content.substr(0, content.length - 1);
      }

      // Order matters here! OLI text needs to be wrapped in the right order.

      // Start with basic text
      content = textDto(content);

      if (textStyle.baselineOffset) {
        if (textStyle.baselineOffset === 'SUPERSCRIPT') {
          content = superscriptDto(content);
        }
        if (textStyle.baselineOffset === 'SUBSCRIPT') {
          content = subscriptDto(content);
        }
      }

      if (textStyle.link) {
        content = linkDto(content, textStyle.link.url);
      }
      if (textStyle.italic) {
        content = italicDto(content);
      }
      if (textStyle.bold) {
        content = boldDto(content);
      }

      lines.push(content);

    } else if (e.footnoteReference !== undefined) {
      lines.push(citeDto(e.footNoteReference.footnoteId));

    } else if (isImage(e)) {
      lines.push(imageWithContext(context, inlineIdFromElement(e), true).toPersistence());

    } else {
      context.errors.push(`Unknown element could not be imported: ${JSON.stringify(e)}`);
    }
  }
}

function getBasicText(cell): string {
  if (cell.content.length === 1 && cell.content[0].paragraph) {
    const p = cell.content[0].paragraph;
    if (p.elements.length > 0) {
      if (p.elements[0].textRun && p.elements[0].textRun.content) {
        return p.elements[0].textRun.content.trim();
      }
    }
  }
  return '';
}

function simpleText(paragraph) {
  return paragraph.elements.map(e => e.textRun.content).join('').trim();
}

function structuredText(context: Context, cell): ContentElements {
  if (cell.content.length === 1 && cell.content[0].paragraph) {
    const p = cell.content[0].paragraph;
    if (p.elements.length > 0) {
      return extractParagraph(context, p);
    }
  }
  return new ContentElements({ supportedElements: Immutable.List(WB_ELEMENTS) });
}

// Predicates

function isText(e) {
  return e.textRun !== undefined;
}

function isImage(c) {
  // Test for both google doc elements and content items (which contain elements)

  // element
  return c.inlineObjectElement ||
    // content item
    c.paragraph !== undefined
    && c.paragraph.paragraphStyle.namedStyleType === 'NORMAL_TEXT'
    && c.paragraph.elements[0].inlineObjectElement;
}

function isHeading(c) {
  return c.paragraph !== undefined &&
    c.paragraph.paragraphStyle.namedStyleType.startsWith('HEADING');
}

function isListItem(c) {
  return c.paragraph !== undefined
    && c.paragraph.paragraphStyle.namedStyleType === 'NORMAL_TEXT'
    && c.paragraph.bullet !== undefined;
}

function isParagraph(c) {
  return c.paragraph !== undefined &&
    c.paragraph.paragraphStyle.namedStyleType === 'NORMAL_TEXT';
}

function isTable(c) {
  return c.table !== undefined;
}

function isYoutube(customElement: string | null) {
  return customElement === 'youtube';
}

function isFormative(customElement: string | null) {
  return customElement === 'formative';
}

function isSummative(customElement: string | null) {
  return customElement === 'summative';
}

function isObjectives(customElement: string | null) {
  return customElement === 'objectives';
}

function isGenericTable(customElement: string | null) {
  return customElement === null;
}

function isSectionBreak(c) {
  return c.sectionBreak !== undefined;
}

function hasActiveList(context) {
  return context.activeListItems.length > 0;
}

function hasImageProperties(inline) {
  return inline.inlineObjectProperties
    && inline.inlineObjectProperties.embeddedObject
    && inline.inlineObjectProperties.embeddedObject.imageProperties;
}
