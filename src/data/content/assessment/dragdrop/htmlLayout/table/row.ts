import * as Immutable from 'immutable';
import { augment } from 'data/content/common';
import { Cell } from 'data/content/assessment/dragdrop/htmlLayout/table/cell';
import createGuid from 'utils/guid';

export type RowParams = {
  guid?: string;
  cells?: Immutable.List<Cell>;
  isHeader?: boolean;
};

const defaultContent = {
  contentType: 'DndTableRow',
  elementType: '#cdata',
  guid: '',
  cells: Immutable.List<Cell>(),
  isHeader: false,
};

export class Row extends Immutable.Record(defaultContent) {

  contentType: 'DndTableRow';
  elementType: '#cdata';
  guid: string;
  cells: Immutable.List<Cell>;
  isHeader: boolean;

  constructor(params?: RowParams) {
    super(augment(params));
  }

  with(values: RowParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(rowEl: Element, guid: string): Row {
    const model = new Row().with({
      guid,
      isHeader: rowEl.className && rowEl.className.includes('dnd-row-header'),
      cells: Immutable.List<Cell>(
        Array.from(rowEl.children).map(cellDiv => Cell.fromPersistence(cellDiv, createGuid())),
      ),
    });

    return model;
  }

  toPersistence(): string {
    return `<div class="dnd-row${this.isHeader ? ' dnd-row-header' : ''}">`
      + this.cells.reduce((acc, cell) => `${acc} ${cell.toPersistence()}`, '')
      + '</div>';
  }
}
