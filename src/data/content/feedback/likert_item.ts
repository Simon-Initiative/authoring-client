import * as Immutable from 'immutable';
import { getChildren, augment, ensureIdGuidPresent } from 'data/content/common';
import { getKey } from 'data/common';
import createGuid from 'utils/guid';
import { FeedbackPrompt } from './feedback_prompt';
import { Maybe } from 'tsmonad';

type LikertItemParams = {
  guid?: string;
  id?: string;
  prompt?: FeedbackPrompt;
  // required = does this question require a response?
  required?: boolean;
  group?: Maybe<string>; // for use with the "Survey Report" function
};

const defaultLikertItemParams = {
  contentType: 'LikertItem',
  elementType: 'item',
  guid: '',
  id: '',
  prompt: new FeedbackPrompt(),
  required: false,
  group: Maybe.nothing<string>(),
};

export class LikertItem extends Immutable.Record(defaultLikertItemParams) {
  contentType: 'LikertItem';
  elementType: 'item';
  guid: string;
  id: string;
  prompt: FeedbackPrompt;
  required: boolean;
  group: Maybe<string>;

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

    if (o['@group'] !== undefined) {
      const group = Maybe.just(o['@group']);
      model = model.with({ group });
    }

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

    const item = {
      item: {
        '@id': this.id,
        '@required': this.required.toString(),
        '#array': children,
      },
    };
    this.group.lift(g => item.item['@group'] = g);
    return item;
  }
}
