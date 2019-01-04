import * as Immutable from 'immutable';
import { ContentElements, TEXT_ELEMENTS } from '../common/elements';
import { getChildren } from '../common';

type LikertLabelParams = {
  guid?: string;
  text?: ContentElements;
  // value = integer value in the scale described by the text label
  value?: string;
};

const defaultLikertLabelParams: LikertLabelParams = {
  guid: '',
  text: ContentElements.fromText('', '', TEXT_ELEMENTS),
  value: '',
};

export class LikertLabel extends Immutable.Record(defaultLikertLabelParams) {
  guid: string;
  text: ContentElements;
  value: string;

  constructor(params?: LikertLabelParams) {
    super(params);
  }

  with(values: LikertLabelParams): LikertLabel {
    return this.merge(values) as this;
  }

  static fromPersistence(json: any, guid: string, notify: () => void = () => null): LikertLabel {
    let model = new LikertLabel();

    const o = json.label;

    model = model.with({ value: o['@value'] });

    const text = ContentElements.fromPersistence(getChildren(o), '', TEXT_ELEMENTS, null, notify);
    model = model.with({ text });

    return model;
  }

  toPersistence(): Object {
    return {
      label: {
        '@value': this.value,
        '#text': this.text.extractPlainText().caseOf({
          just: s => s,
          nothing: () => '',
        }),
      },
    };
  }
}
