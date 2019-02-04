import * as Immutable from 'immutable';
import { getChildren, augment, ensureIdGuidPresent } from 'data/content/common';
import { getKey } from 'data/common';
import createGuid from 'utils/guid';
import { FeedbackPrompt } from './feedback_prompt';

type LikertItemParams = {
  guid?: string;
  id?: string;
  prompt?: FeedbackPrompt;
  // required = does this question require a response?
  required?: boolean;
};

const defaultLikertItemParams = {
  contentType: 'LikertItem',
  elementType: 'item',
  guid: '',
  id: '',
  prompt: new FeedbackPrompt(),
  required: false,
};

export class LikertItem extends Immutable.Record(defaultLikertItemParams) {
  contentType: 'LikertItem';
  elementType: 'item';
  guid?: string;
  id?: string;
  prompt?: FeedbackPrompt;
  required?: boolean;

  constructor(params?: LikertItemParams) {
    super(augment(params, true));
  }

  with(values: LikertItemParams): LikertItem {
    return this.merge(values) as this;
  }

  clone(): LikertItem {
    return ensureIdGuidPresent(this.with({
      prompt: this.prompt.clone(),
    }));
  }

  static fromPersistence(json: any, guid: string, notify: () => void = () => null): LikertItem {
    let model = new LikertItem({ guid });

    const o = json.item;

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
        default:
      }
    });

    return model;
  }

  toPersistence(): Object {
    const children = [
      this.prompt.toPersistence(),
    ];

    return {
      item: {
        '@id': this.id,
        '@required': this.required.toString(),
        '#array': children,
      },
    };
  }
}
