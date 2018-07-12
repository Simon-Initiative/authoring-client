import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';
import { augment } from 'data/content/common';
import { domParser } from 'utils/domParser';
import { Cell } from 'data/content/assessment/dragdrop/htmlLayout/table/cell';
import createGuid from 'utils/guid';

export type RowParams = {
  guid?: string;
  cells?: Immutable.List<Cell>;
};

const defaultContent = {
  contentType: 'Row',
  elementType: 'row',
  guid: '',
  cells: Immutable.List<Cell>(),
};

export class Row extends Immutable.Record(defaultContent) {

  contentType: 'Row';
  elementType: 'row';
  guid: string;
  cells: Immutable.List<Cell>;

  constructor(params?: RowParams) {
    super(augment(params));
  }

  with(values: RowParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(rowEl: Element, guid: string): Row {
    const model = new Row().with({
      guid,
      cells: Immutable.List<Cell>(
        Array.from(rowEl.children).map(cellDiv => Cell.fromPersistence(cellDiv, createGuid())),
      ),
    });

    return model;
  }

  toPersistence(): string {
    return '<div class="dnd-row">'
      + this.cells.reduce((acc, cell) => `${acc} ${cell.toPersistence()}`, '')
      + '</div>';
  }
}
