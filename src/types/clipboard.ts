import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';
import { ContentElement } from 'data/content/common/interfaces';

export type ClipboardParams = {
  item?: Maybe<ContentElement>;
};

const defaultContent = {
  item: Maybe.nothing(),
};

export class Clipboard extends Immutable.Record(defaultContent) {

  item: Maybe<ContentElement>;

  constructor(params?: ClipboardParams) {
    super(params);
  }

  with(values: ClipboardParams) {
    return this.merge(values) as this;
  }

}
