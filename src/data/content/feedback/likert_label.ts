import * as Immutable from 'immutable';

type LikertLabelParams = {
  guid?: string;
  text?: string;
  // value = integer value in the scale described by the text label
  value?: string;
};

const defaultLikertLabelParams: LikertLabelParams = {
  guid: '',
  text: '',
  value: '',
};

export class LikertLabel extends Immutable.Record(defaultLikertLabelParams) {
  guid?: string;
  text?: string;
  value?: string;

  constructor(params?: LikertLabelParams) {
    super(params);
  }

  with(values: LikertLabelParams): LikertLabel {
    return this.merge(values) as this;
  }

  static fromPersistence(json: any, guid: string, notify: () => void = () => null): LikertLabel {
    let model = new LikertLabel();

    const o = json.label;

    // '@value' required
    model = model.with({ value: o['@value'] });

    // '#text' required
    model = model.with({ text: o['#text'] });

    return model;
  }

  toPersistence(): Object {
    return {
      label: {
        '@value': this.value,
        '#text': this.text,
      },
    };
  }
}
