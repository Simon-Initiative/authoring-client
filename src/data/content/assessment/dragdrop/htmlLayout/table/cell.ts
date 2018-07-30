import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';
import { augment } from 'data/content/common';

export type CellParams = {
  guid?: string;
  text?: string;
  target?: Maybe<string>;
};

const defaultContent = {
  contentType: 'DndTableCell',
  elementType: '#cdata',
  guid: '',
  text: '',
  target: Maybe.nothing<string>(),
};

export class Cell extends Immutable.Record(defaultContent) {

  contentType: 'DndTableCell';
  elementType: '#cdata';
  guid: string;
  text: string;
  target: Maybe<string>;

  constructor(params?: CellParams) {
    super(augment(params));
  }

  with(values: CellParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(cellEl: Element, guid: string): Cell {
    const model = new Cell({
      guid,
      text: cellEl.innerHTML,
      target: cellEl.getAttribute('input_ref')
        ? Maybe.just(cellEl.getAttribute('input_ref'))
        : Maybe.nothing(),
    });

    return model;
  }

  toPersistence(): string {
    return '<div'
      + this.target.caseOf({ just: inputVal => ` input_ref="${inputVal}"`, nothing: () => '' })
      + ` class="dnd-cell${this.target.caseOf({ just: () => ' target', nothing: () => '' })}"`
      + `>${this.text}</div>`;
  }
}
