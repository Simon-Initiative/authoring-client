import { Maybe } from 'tsmonad';
import * as Immutable from 'immutable';
import * as contentTypes from 'data/contentTypes';
import { ContentElement } from 'data/content/common/interfaces';
import { ContentParser, ParsedContent, ContentDependency } from 'data/parsers/common/types';
import { toArray } from 'data/parsers/common/utils';
import { ContentElements, INLINE_ELEMENTS } from 'data/content/common/elements';

// Content parser for Google Sheets. See sheets.sample.html for a sample of data
// obtained when pasting from Sheets

const parse : ContentParser = (data: string) : Maybe<ParsedContent> => {
  if (isGoogleSheets(data)) {
    return tryToParse(data);
  }
  return Maybe.nothing();
};

function tryToParse(data: string) : Maybe<ParsedContent> {

  const tableString = data.substr(data.indexOf('<table'));

  const parser = new DOMParser();
  const dom = parser.parseFromString(tableString, 'text/html');

  const table = createTable(dom);

  if (table !== null) {
    const parsed : ParsedContent = {
      elements: Immutable.List<ContentElement>([table]),
      dependencies: Immutable.List<ContentDependency>(),
    };
    return Maybe.just(parsed);
  }
  return Maybe.nothing();
}

function createTable(node) : contentTypes.Table {
  const t = node.getElementsByTagName('table');

  if (t.length > 0) {
    return new contentTypes.Table().with({
      rows: createRows(t[0]),
    });
  }
  return null;
}

function createRows(node) : Immutable.OrderedMap<string, contentTypes.Row> {

  const rows = toArray(node.getElementsByTagName('tr'))
    .map(tr => createRow(tr))
    .reduce(
      (c, p) => {
        return [...c, [(p as any).guid, p]];
      },
      []);

  return Immutable.OrderedMap<string, contentTypes.Row>(rows);
}

function createRow(node) : contentTypes.Row {

  const cells = toArray(node.getElementsByTagName('td'))
    .map(td => createCell(td))
    .reduce(
      (c, p) => {
        return [...c, [(p as any).guid, p]];
      },
      []);

  return new contentTypes.Row().with({
    cells: Immutable.OrderedMap<string, contentTypes.CellData | contentTypes.CellHeader>(cells),
  });
}

function createCell(node) : contentTypes.CellData | contentTypes.CellHeader {

  return new contentTypes.CellData().with({
    content: ContentElements.fromHTML(node.innerHTML, '', INLINE_ELEMENTS),
  });
}

function isGoogleSheets(data: string) : boolean {
  const indicatorPosition = data.indexOf('<meta name="generator" content="Sheets"/>');
  const tablePosition = data.indexOf('<table');

  return indicatorPosition !== -1 && tablePosition !== -1 && tablePosition > indicatorPosition;
}

export default parse;
