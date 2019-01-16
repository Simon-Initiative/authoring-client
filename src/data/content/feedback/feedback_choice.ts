import * as Immutable from 'immutable';
import { ContentElements, TEXT_ELEMENTS } from '../common/elements';
import { getChildren, augment } from '../common';

type FeedbackChoiceParams = {
  guid?: string;
  id?: string;
  text?: ContentElements;
};

const defaultFeedbackChoiceParams = {
  contentType: 'FeedbackChoice',
  elementType: 'choice',
  guid: '',
  id: '',
  text: ContentElements.fromText('', '', TEXT_ELEMENTS),
};

export class FeedbackChoice extends Immutable.Record(defaultFeedbackChoiceParams) {
  contentType: 'FeedbackChoice';
  elementType: 'choice';
  guid: string;
  id: string;
  text: ContentElements;

  constructor(params?: FeedbackChoiceParams) {
    super(augment(params));
  }

  with(values: FeedbackChoiceParams): FeedbackChoice {
    return this.merge(values) as this;
  }

  static fromPersistence(json: any, guid: string, notify: () => void = () => null): FeedbackChoice {
    let model = new FeedbackChoice({ guid });

    const o = json.choice;

    model = model.with({ id: o['@id'] });

    const text = ContentElements.fromPersistence(getChildren(o), '', TEXT_ELEMENTS, null, notify);
    model = model.with({ text });

    return model;
  }

  toPersistence(): Object {
    return {
      choice: {
        '@id': this.id,
        '#text': this.text.extractPlainText().caseOf({
          just: s => s,
          nothing: () => '',
        }),
      },
    };
  }
}
