import * as Immutable from 'immutable';
import { getChildren, augment } from 'data/content/common';
import { getKey } from 'data/common';
import createGuid from 'utils/guid';
import { FeedbackPrompt } from './feedback_prompt';
import { LikertScale } from './likert_scale';

type LikertParams = {
  guid?: string;
  id?: string;
  prompt?: FeedbackPrompt;
  scale?: LikertScale;
  // required = does this question require a response?
  required?: boolean;
};

const defaultLikertParams = {
  contentType: 'Likert',
  elementType: 'likert',
  guid: '',
  id: '',
  prompt: new FeedbackPrompt(),
  scale: new LikertScale(),
  required: false,
};

export class Likert extends Immutable.Record(defaultLikertParams) {
  contentType: 'Likert';
  elementType: 'likert';
  guid: string;
  id: string;
  prompt: FeedbackPrompt;
  scale: LikertScale;
  required: boolean;

  constructor(params?: LikertParams) {
    super(augment(params));
  }

  with(values: LikertParams): Likert {
    return this.merge(values) as this;
  }

  static fromPersistence(json: any, guid: string, notify: () => void = () => null): Likert {
    let model = new Likert({ guid });

    const o = json.likert;

    // '@id' required
    model = model.with({ id: o['@id'] });

    if (o['@required'] !== undefined) {
      model = model.with({
        required:
          // JSON.parse will convert to boolean
          JSON.parse((o['@required'] as string).toLowerCase()),
      });
    } else {
      model = model.with({ required: false });
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
        case 'likert_scale':
          model = model.with({
            scale: LikertScale.fromPersistence(item, id, notify),
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
      this.scale.toPersistence(),
    ];

    const dto = {
      likert: {
        '@id': this.id,
      },
    };

    if (this.required) {
      dto.likert['@required'] = this.required.toString();
    }
    dto.likert['#array'] = children;

    return dto;
  }
}
