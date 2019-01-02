import * as Immutable from 'immutable';
import { getChildren } from 'data/content/common';
import { getKey } from 'data/common';
import createGuid from 'utils/guid';
import { FeedbackChoice } from './feedback_choice';
import { FeedbackPrompt } from './feedback_prompt';

type FeedbackMultipleChoiceParams = {
  guid?: string;
  id?: string;
  prompt?: FeedbackPrompt;
  // required = does this question require a response?
  required?: boolean;
  // choices must be non-empty
  choices?: Immutable.OrderedMap<string, FeedbackChoice>;
};

const defaultFeedbackMultipleChoiceParams: FeedbackMultipleChoiceParams = {
  guid: '',
  id: '',
  prompt: new FeedbackPrompt(),
  required: false,
  choices: Immutable.OrderedMap<string, FeedbackChoice>([
    [createGuid(), new FeedbackChoice()],
  ]),
};

export class FeedbackMultipleChoice extends Immutable.Record(defaultFeedbackMultipleChoiceParams) {
  guid?: string;
  id?: string;
  prompt?: FeedbackPrompt;
  required?: boolean;
  choices?: Immutable.OrderedMap<string, FeedbackChoice>;

  constructor(params?: FeedbackMultipleChoiceParams) {
    super(params);
  }

  with(values: FeedbackMultipleChoiceParams): FeedbackMultipleChoice {
    return this.merge(values) as this;
  }

  static fromPersistence(
    json: any, guid: string, notify: () => void = () => null): FeedbackMultipleChoice {
    let model = new FeedbackMultipleChoice({ guid });

    const o = json.multiple_choice;

    // '@id' required
    model = model.with({ id: o['@id'] });

    // '@required' required, defaults to false
    model = model.with({ required: JSON.parse((o['@required'] as string).toLowerCase()) });

    getChildren(o).forEach((item) => {
      const key = getKey(item);
      const id = createGuid();

      switch (key) {
        case 'prompt':
          model = model.with({
            prompt: FeedbackPrompt.fromPersistence(item, id, notify),
          });
          break;
        case 'choice':
          model = model.with({
            choices: model.choices.set(id, FeedbackChoice.fromPersistence(item, id, notify)),
          });
          break;
        default:
      }
    });

    return model;
  }

  toPersistence(): Object {
    const children = [
      this.prompt.toPersistence(),
      ...this.choices.toArray().map(item => item.toPersistence()),
    ];

    return {
      multiple_choice: {
        '@id': this.id,
        '@required': this.required.toString(),
        '#array': children,
      },
    };
  }
}
