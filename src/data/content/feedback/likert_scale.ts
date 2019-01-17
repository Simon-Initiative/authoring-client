import * as Immutable from 'immutable';
import { LikertLabel } from './likert_label';
import { getChildren, augment, ensureIdGuidPresent } from 'data/content/common';
import { getKey } from 'data/common';
import createGuid from 'utils/guid';

type LikertScaleParams = {
  guid?: string,
  labels?: Immutable.OrderedMap<string, LikertLabel>,
  // size = odd integer, number of values in the scale
  scaleSize?: string,
  // center = integer, median value on the scale
  scaleCenter?: string,
};

const defaultLikertScaleParams = {
  contentType: 'LikertScale',
  elementType: 'likert_scale',
  guid: '',
  labels: Immutable.OrderedMap<string, LikertLabel>(),
  scaleSize: '',
  scaleCenter: '',
};

export class LikertScale extends Immutable.Record(defaultLikertScaleParams) {
  contentType: 'LikertScale';
  elementType: 'likert_scale';
  guid: string;
  labels: Immutable.OrderedMap<string, LikertLabel>;
  scaleSize: string;
  scaleCenter: string;

  constructor(params?: LikertScaleParams) {
    super(augment(params));
  }

  with(values: LikertScaleParams): LikertScale {
    return this.merge(values) as this;
  }

  clone(): LikertScale {
    return ensureIdGuidPresent(this);
  }

  static fromPersistence(json: any, guid: string, notify: () => void = () => null): LikertScale {
    let model = new LikertScale({ guid });

    const o = json.likert_scale;

    if (o['@size'] !== undefined) {
      model = model.with({ scaleSize: o['@size'] });
    }
    if (o['@center'] !== undefined) {
      model = model.with({ scaleCenter: o['@center'] });
    }

    getChildren(o).forEach((item) => {
      const key = getKey(item);
      const id = createGuid();

      switch (key) {
        case 'label':
          model = model.with({
            labels: model.labels.set(id, LikertLabel.fromPersistence(item, id, notify)),
          });
          break;
        default:
          break;
      }
    });

    return model;
  }

  toPersistence(): Object {
    const children = this.labels.toArray().map(label => label.toPersistence());

    return {
      likert_scale: {
        '@size': this.scaleSize,
        '@center': this.scaleCenter,
        '#array': children,
      },
    };
  }
}
