import { Maybe } from 'tsmonad';
import * as Immutable from 'immutable';
import * as contentTypes from 'data/contentTypes';
import { ContentElement } from 'data/content/common/interfaces';
import { ContentParser, ParsedContent, ContentDependency } from 'data/parsers/common/types';
import { toArray } from 'data/parsers/common/utils';
import { ContentElements } from 'data/content/common/elements';
import createGuid from 'utils/guid';

// Parser for Google Docs.  See docs.sample.html for a sample of the data format.


const parse : ContentParser = (data: string) : Maybe<ParsedContent> => {
  if (isGoogleDocs(data)) {
    return tryToParse(data);
  }
  return Maybe.nothing();
};

function tryToParse(data: string) : Maybe<ParsedContent> {

  // Find the outermost b tag.  Google docs wrap everything in this tag.
  // I suspect it is meant to represent 'body'
  const bString = data.substr(data.indexOf('<b style'));

  const parser = new DOMParser();
  const dom = parser.parseFromString(bString, 'text/html');

  // Now get the outermost b tag as an actual DOM Element
  const b = findTopLevelB(dom);

  if (b !== null) {

    // Recursively parse it's children nodes, careful to track
    // any remote file depedencies we encounter
    const dependencies = [];
    const elements = parseChildren(b.childNodes, dependencies);
    return elements.length > 0
      ? Maybe.just({
        elements: Immutable.List<ContentElement>(elements),
        dependencies: Immutable.List<ContentDependency>(dependencies),
      })
      : Maybe.nothing();
  }
  return Maybe.nothing();
}

function findTopLevelB(dom) {
  const b = dom.getElementsByTagName('b');

  if (b.length > 0) {
    return b[0];
  }
  return null;
}

// Takes a collection of child nodes and parses and converts
// them into ContentElement instances
function parseChildren(children, dependencies) : ContentElement[] {

  // Store all the content elements
  const arr = [];

  // Buffer paragraphs here until we are ready to package them
  // into a contiguous text instance
  const contiguous = [];

  // A helper function to check the contiguous buffer and if
  // non-empty convert it contiguous text and store it
  const commitContiguous = () => {
    if (contiguous.length > 0) {
      arr.push(contentTypes.ContiguousText.fromHTML(
        contiguous.reduce((c, p) => c + p), createGuid()));
      contiguous.splice(0, contiguous.length);
    }
  };

  for (let i = 0; i < children.length; i = i + 1) {
    const item = children[i];


    if (item.localName === 'p') {

      // Stand alone images are wrapped inside a p, then inside a span
      if (item.childNodes.length === 1 && item.childNodes[0].localName === 'span'
        && item.childNodes[0].childNodes.length === 1
        && item.childNodes[0].childNodes[0].localName === 'img') {

        commitContiguous();

        const img = createImage(item, dependencies);

        if (img !== null) {
          arr.push(img);
        }
      } else {
        contiguous.push(item.outerHTML);
      }

    } else if (item.localName === 'div'
      && item.childNodes.length === 1 && item.childNodes[0].localName === 'table') {

      commitContiguous();
      const table = createTable(item.childNodes[0], dependencies);

      if (table !== null) {
        arr.push(table);
      }

    } else if (item.localName === 'ol') {
      commitContiguous();

      const ol = createOl(item, dependencies);

      if (ol !== null) {
        arr.push(ol);
      }
    } else if (item.localName === 'ul') {
      commitContiguous();

      const ul = createUl(item, dependencies);

      if (ul !== null) {
        arr.push(ul);
      }

    } else if (item.localName === 'br') {
      contiguous.push('<br/>');

    // Handle h1, h2, h3, etc and convert them to simple paragraphs
    } else if (item.localName.startsWith('h') && item.localName.length === 2) {
      contiguous.push(
        '<p>' + item.childNodes[0].outerHTML + '</p>',
        );
    }
  }
  commitContiguous();

  return arr;
}

// Helper function to take an array of ContentElement and convert it
// a full ContentElements instance
function toContentElements(elements: ContentElement[]) {
  const arr = elements.map(e => [e.guid, e]);
  return new ContentElements().with({
    content: Immutable.OrderedMap<string, ContentElement>(arr),
  });
}

function createOl(node, dependencies) : contentTypes.Ol {

  const li = node.getElementsByTagName('li');

  if (li.length > 0) {

    const arr = toArray(li)
      .map((item: any) => {
        const elements = parseChildren(item.childNodes, dependencies);
        return new contentTypes.Li().with({
          content: toContentElements(elements),
        });
      })
      .map(item => [item.guid, item]);
    const listItems = Immutable.OrderedMap<string, contentTypes.Li>(arr);

    return new contentTypes.Ol().with({ listItems });
  }
  return null;
}

function createUl(node, dependencies) : contentTypes.Ul {

  const li = node.getElementsByTagName('li');

  if (li.length > 0) {

    const arr = toArray(li)
      .map((item: any) => {
        const elements = parseChildren(item.childNodes, dependencies);
        return new contentTypes.Li().with({
          content: toContentElements(elements),
        });
      })
      .map(item => [item.guid, item]);
    const listItems = Immutable.OrderedMap<string, contentTypes.Li>(arr);

    return new contentTypes.Ul().with({ listItems });
  }
  return null;
}

function createImage(node, dependencies) : contentTypes.Image {
  const t = node.getElementsByTagName('img');

  if (t.length > 0) {

    const img = t[0] as Element;
    const src = img.getAttribute('src');
    const height = img.getAttribute('height');
    const width = img.getAttribute('width');
    const guid = createGuid();

    dependencies.push({
      type: 'RemoteResource',
      guid,
      url: src,
    });

    return new contentTypes.Image().with({
      guid,
      src,
      width,
      height,
    });
  }
  return null;
}


function createTable(node, dependencies) : contentTypes.Table {

  return new contentTypes.Table().with({
    rows: createRows(node, dependencies),
  });
}

function createRows(node, dependencies) : Immutable.OrderedMap<string, contentTypes.Row> {

  const rows = toArray(node.getElementsByTagName('tr'))
    .map(tr => createRow(tr, dependencies))
    .reduce(
      (c, p) => {
        return [...c, [(p as any).guid, p]];
      },
      []);

  return Immutable.OrderedMap<string, contentTypes.Row>(rows);
}

function createRow(node, dependencies) : contentTypes.Row {

  const cells = toArray(node.getElementsByTagName('td'))
    .map(td => createCell(td, dependencies))
    .reduce(
      (c, p) => {
        return [...c, [(p as any).guid, p]];
      },
      []);

  return new contentTypes.Row().with({
    cells: Immutable.OrderedMap<string, contentTypes.CellData | contentTypes.CellHeader>(cells),
  });
}

function createCell(node, dependencies) : contentTypes.CellData | contentTypes.CellHeader {

  const elements = parseChildren(node.childNodes, dependencies);
  return new contentTypes.CellData().with({
    content: toContentElements(elements),
  });

}

function isGoogleDocs(data: string) : boolean {
  const isSheets = data.indexOf('<meta name="generator" content="Sheets"/>') >= 0;
  const isGoogle = data.indexOf('<meta charset="utf-8">') >= 0;

  return isGoogle && !isSheets;
}

export default parse;
