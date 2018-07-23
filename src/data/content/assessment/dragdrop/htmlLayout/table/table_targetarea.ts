import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';
import { augment } from 'data/content/common';
import { domParser } from 'utils/domParser';
import { Row } from 'data/content/assessment/dragdrop/htmlLayout/table/row';
import createGuid from 'utils/guid';

export type TableTargetAreaParams = {
  guid?: string;
  rows?: Immutable.List<Row>;
};

const defaultContent = {
  contentType: 'DndTableTargetArea',
  elementType: 'targetArea',
  guid: '',
  rows: Immutable.List<Row>(),
};

export class TableTargetArea extends Immutable.Record(defaultContent) {

  contentType: 'DndTableTargetArea';
  elementType: 'targetArea';
  guid: string;
  rows: Immutable.List<Row>;

  constructor(params?: TableTargetAreaParams) {
    super(augment(params));
  }

  with(values: TableTargetAreaParams) {
    return this.merge(values) as this;
  }

  clone() {
    return this;
  }

  static fromPersistence(json: Object, guid: string) : TableTargetArea {
    const q = (json as any).targetArea;

    const htmlStr = q['#cdata'] as string;
    let html = Maybe.nothing<Element>();
    try {
      const htmlDoc = domParser.parseFromString(htmlStr, 'text/html');
      html = Maybe.just(
        // get first child of body element
        htmlDoc.getElementsByTagName('html').item(0)
          .getElementsByTagName('body').item(0)
          .firstChild as Element,
      );
    } catch (error) {
      console.error('failed to load table target area html: ', error);
    }

    const model = new TableTargetArea({
      guid,
      rows: html.caseOf({
        just: htmlEl => Immutable.List<Row>(
          Array.from(htmlEl.children).map(
          rowDiv => Row.fromPersistence(rowDiv, createGuid()),
        )),
        nothing: () => Immutable.List<Row>(),
      }),
    });

    return model;
  }

  toPersistence() : Object {
    return {
      [this.elementType]: ({
        '#cdata': '<div class="oli-dnd-table">'
          + this.rows.reduce((acc, row) => `${acc} ${row.toPersistence()}`, '')
          + '</div>',
      }),
    };
  }
}
