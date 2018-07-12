import * as Immutable from 'immutable';
import { CSSProperties } from 'react';
import { Maybe } from 'tsmonad';
import { augment } from 'data/content/common';

const parseStylesFromString = (styles: string) => {
  //TODO
  return {};
};

const stringifyStyles = (styles: CSSProperties) => {
  //TODO
  return '';
};

const DEFAULT_CELL_STYLE = {};

export type CellParams = {
  guid?: string;
  style?: CSSProperties;
  className?: string;
  text?: string;
  target?: Maybe<string>;
};

const defaultContent = {
  contentType: 'Cell',
  elementType: 'cell',
  guid: '',
  style: DEFAULT_CELL_STYLE,
  className: 'dnd-cell',
  text: '',
  target: Maybe.nothing<string>(),
};

export class Cell extends Immutable.Record(defaultContent) {

  contentType: 'Cell';
  elementType: 'cell';
  guid: string;
  style: CSSProperties;
  className: string;
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
      style: cellEl.getAttribute('style') && parseStylesFromString(cellEl.getAttribute('style')),
      className: cellEl.getAttribute('class') && cellEl.getAttribute('class'),
      text: cellEl.innerHTML,
      target: cellEl.getAttribute('input_ref')
        ? Maybe.just(cellEl.getAttribute('input_ref'))
        : Maybe.nothing(),
    });

    return model;
  }

  toPersistence(): string {
    return '<div'
      + this.target.caseOf({ just: inputVal => ` input_val="${inputVal}"`, nothing: () => '' })
      + ` class="dnd-cell${this.className ? ` ${this.className}` : ''}"`
      + ` style="${stringifyStyles(this.style)}"`
      + `>${this.text}</div>`;
  }
}
