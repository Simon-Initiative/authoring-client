import * as Immutable from 'immutable';
import { ContentElements, TEXT_ELEMENTS } from '../common/elements';
import { getChildren, augment } from '../common';
import { ensureIdGuidPresent } from 'data/content/common';

type LikertLabelParams = {
  guid?: string;
  text?: ContentElements;
  // value = integer value in the scale described by the text label
  value?: string;
};

const defaultLikertLabelParams = {
  contentType: 'LikertLabel',
  elementType: 'label',
  guid: '',
  text: ContentElements.fromText('', '', TEXT_ELEMENTS),
  value: '',
};

export class LikertLabel extends Immutable.Record(defaultLikertLabelParams) {
  contentType: 'LikertLabel';
  elementType: 'label';
  guid: string;
  text: ContentElements;
  value: string;

  constructor(params?: LikertLabelParams) {
    super(augment(params));
  }

  with(values: LikertLabelParams): LikertLabel {
    return this.merge(values) as this;
  }

  clone(): LikertLabel {
    return ensureIdGuidPresent(this.with({
      text: this.text.clone(),
    }));
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
