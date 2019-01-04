import * as Immutable from 'immutable';
import createGuid from 'utils/guid';
import { INLINE_ELEMENTS, ContentElements } from '../common/elements';

type FeedbackPromptParams = {
  guid?: string;
  content?: ContentElements;
};

const defaultFeedbackPromptParams: FeedbackPromptParams = {
  guid: '',
  content: new ContentElements().with({ supportedElements: Immutable.List(INLINE_ELEMENTS) }),
};

export class FeedbackPrompt extends Immutable.Record(defaultFeedbackPromptParams) {
  guid: string;
  content: ContentElements;

  constructor(params?: FeedbackPromptParams) {
    super(params);
  }

  with(values: FeedbackPromptParams): FeedbackPrompt {
    return this.merge(values) as this;
  }

  static fromPersistence(json: any, guid: string, notify: () => void = () => null): FeedbackPrompt {
    let model = new FeedbackPrompt({ guid });

    const o = json.prompt;

    model = model.with({
      content: ContentElements
        .fromPersistence(o, createGuid(), INLINE_ELEMENTS, null, notify),
    });

    return model;
  }

  toPersistence(): Object {
    return {
      prompt: {
        '#array': this.content.toPersistence(),
      },
    };
  }
}
