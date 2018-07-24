import * as Immutable from 'immutable';
import { augment, ensureIdGuidPresent } from '../common';

export type ParamTextParams = {
  text?: string,
  guid?: string,
};

const defaultContent = {
  contentType: 'ParamText',
  elementType: 'paramtext',
  text: '',
  guid: '',
};

export class ParamText extends Immutable.Record(defaultContent) {

  contentType: 'ParamText';
  elementType: 'paramtext';
  text: string;
  guid: string;

  constructor(params?: ParamTextParams) {
    super(augment(params));
  }

  with(values: ParamTextParams) {
    return this.merge(values) as this;
  }

  clone() : ParamText {
    return ensureIdGuidPresent(this);
  }

  static fromPersistence(root: Object, guid: string, notify: () => void) : ParamText {

    const p = (root as any);

    let model = new ParamText({ guid });

    if (p['#text'] !== undefined) {
      model = model.with({ text: p['#text'] });
    }

    return model;
  }

  toPersistence() : Object {
    return {
      '#text': this.text,
    };
  }
}
