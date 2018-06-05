import { Maybe } from 'tsmonad';
import * as Immutable from 'immutable';
import * as contentTypes from 'data/contentTypes';
import { ContentElement } from 'data/content/common/interfaces';
import { ContentParser } from 'data/parsers/common/types';
import { toArray } from 'data/parsers/common/utils';
import { ContentElements, INLINE_ELEMENTS } from 'data/content/common/elements';

const parse : ContentParser = (data: string) : Maybe<ContentElement> => {
  if (isGoogleSheets(data)) {
    return tryToParse(data);
  }
  return Maybe.nothing();
};

function tryToParse(data: string) : Maybe<ContentElement> {

  const tableString = data.substr(data.indexOf('<table'));

  const parser = new DOMParser();
  const dom = parser.parseFromString(tableString, 'application/xml');

  const table = createTable(dom);

  if (table !== null) {
    return Maybe.just(table);
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

  console.log(node);

  return new contentTypes.CellData().with({
    content: ContentElements.fromText(node.nodeValue, '', INLINE_ELEMENTS),
  });
}

function isGoogleSheets(data: string) : boolean {
  const indicatorPosition = data.indexOf('<meta name="generator" content="Sheets"/>');
  const tablePosition = data.indexOf('<table');

  return indicatorPosition !== -1 && tablePosition !== -1 && tablePosition > indicatorPosition;
}

export default parse;
