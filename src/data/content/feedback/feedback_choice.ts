import * as Immutable from 'immutable';

type FeedbackChoiceParams = {
  guid?: string;
  id?: string;
  text?: string;
};

const defaultFeedbackChoiceParams: FeedbackChoiceParams = {
  guid: '',
  id: '',
  text: '',
};

export class FeedbackChoice extends Immutable.Record(defaultFeedbackChoiceParams) {
  guid?: string;
  id?: string;
  text?: string;

  constructor(params?: FeedbackChoiceParams) {
    super(params);
  }

  with(values: FeedbackChoiceParams): FeedbackChoice {
    return this.merge(values) as this;
  }

  static fromPersistence(json: any, guid: string, notify: () => void = () => null): FeedbackChoice {
    let model = new FeedbackChoice({ guid });

    const o = json.choice;

    // '@id' required
    model = model.with({ id: o['@id'] });

    // '#text' required
    model = model.with({ text: o['#text'] });

    return model;
  }

  toPersistence(): Object {
    return {
      choice: {
        '@id': this.id,
        '#text': this.text,
      },
    };
  }
}
