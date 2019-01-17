import * as Immutable from 'immutable';
import { getChildren, augment, ensureIdGuidPresent } from 'data/content/common';
import { getKey } from 'data/common';
import createGuid from 'utils/guid';
import { FeedbackPrompt } from './feedback_prompt';

type FeedbackOpenResponseParams = {
  guid?: string;
  id?: string;
  prompt?: FeedbackPrompt;
  // required = does this question require a response?
  required?: boolean;
};

const defaultFeedbackOpenResponseParams = {
  contentType: 'FeedbackOpenResponse',
  elementType: 'open_response',
  guid: '',
  id: '',
  prompt: new FeedbackPrompt(),
  required: false,
};

export class FeedbackOpenResponse extends Immutable.Record(defaultFeedbackOpenResponseParams) {
  contentType: 'FeedbackOpenResponse';
  elementType: 'open_response';
  guid: string;
  id: string;
  prompt: FeedbackPrompt;
  required: boolean;

  constructor(params?: FeedbackOpenResponseParams) {
    super(augment(params));
  }

  with(values: FeedbackOpenResponseParams): FeedbackOpenResponse {
    return this.merge(values) as this;
  }

  clone(): FeedbackOpenResponse {
    return ensureIdGuidPresent(this.with({
      prompt: this.prompt.clone(),
    }));
  }

  static fromPersistence(
    json: any, guid: string, notify: () => void = () => null): FeedbackOpenResponse {
    let model = new FeedbackOpenResponse({ guid });

    const o = json.open_response;

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
        default:
          break;
      }
    });

    return model;
  }

  toPersistence(): Object {
    const children = [
      this.prompt.toPersistence(),
    ];

    const dto = {
      open_response: {
        '@id': this.id,
      },
    };

    if (this.required) {
      dto.open_response['@required'] = this.required.toString();
    }
    dto.open_response['#array'] = children;

    return dto;
  }
}
