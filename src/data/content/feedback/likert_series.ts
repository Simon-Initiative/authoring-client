import * as Immutable from 'immutable';
import { getChildren } from 'data/content/common';
import { getKey } from 'data/common';
import createGuid from 'utils/guid';
import { FeedbackPrompt } from './feedback_prompt';
import { LikertScale } from './likert_scale';
import { LikertItem } from './likert_item';

type LikertSeriesParams = {
  guid?: string;
  prompt?: FeedbackPrompt;
  scale?: LikertScale;
  // must be non-empty
  items?: Immutable.OrderedMap<string, LikertItem>;
};

const defaultLikertSeriesParams: LikertSeriesParams = {
  guid: '',
  prompt: new FeedbackPrompt(),
  scale: new LikertScale(),
  items: Immutable.OrderedMap<string, LikertItem>([
    [createGuid(), new LikertItem()],
  ]),
};

export class LikertSeries extends Immutable.Record(defaultLikertSeriesParams) {
  guid: string;
  prompt: FeedbackPrompt;
  scale: LikertScale;
  items: Immutable.OrderedMap<string, LikertItem>;

  constructor(params?: LikertSeriesParams) {
    super(params);
  }

  with(values: LikertSeriesParams): LikertSeries {
    return this.merge(values) as this;
  }

  static fromPersistence(json: any, guid: string, notify: () => void = () => null): LikertSeries {
    let model = new LikertSeries({ guid });

    const o = json.likert_series;

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
        case 'item':
          model = model.with({
            items: model.items.set(id, LikertItem.fromPersistence(item, id, notify)),
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
      ...this.items.size === 0
        ? [(new LikertItem()).toPersistence()]
        : this.items.toArray().map(item => item.toPersistence()),
    ];

    return {
      likert_series: {
        '#array': children,
      },
    };
  }
}
