import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';

export type ClipboardParams = {
  item?: Maybe<Object>;
};

const defaultContent = {
  item: Maybe.nothing(),
};

export class Clipboard extends Immutable.Record(defaultContent) {

  item: Maybe<Object>;

  constructor(params?: ClipboardParams) {
    super(params);
  }

  with(values: ClipboardParams) {
    return this.merge(values) as this;
  }

}
