import * as Immutable from 'immutable';
import createGuid from '../../../utils/guid';
import { augment, getChildren, ensureIdGuidPresent, setId } from '../common';
import { getKey } from '../../common';
import { Asset } from './asset';

export type EmbedActivityParams = {
  id?: string;
  width?: string;
  height?: string;
  title?: string;
  source?: string;
  assets?: Immutable.List<Asset>;
  guid?: string;
};

const defaultContent = {
  contentType: 'EmbedActivity',
  elementType: 'embed_activity',
  id: '',
  width: '',
  height: '',
  title: '',
  source: '',
  assets: Immutable.List<Asset>(),
  guid: '',
};

export class EmbedActivity extends Immutable.Record(defaultContent) {

  contentType: 'EmbedActivity';
  elementType: 'embed_activity';
  id: string;
  width: string;
  height: string;
  title: string;
  source: string;
  assets: Immutable.List<Asset>;
  guid: string;

  constructor(params?: EmbedActivityParams) {
    super(augment(params, true));
  }

  with(values: EmbedActivityParams) {
    return this.merge(values) as this;
  }

  clone(): EmbedActivity {
    return ensureIdGuidPresent(this.with({
      assets: this.assets.map(asset => asset.clone()).toList(),
    }));
  }

  static fromPersistence(root: Object, guid: string, notify: () => void): EmbedActivity {

    const t = (root as any).embed_activity;

    let model = new EmbedActivity({ guid });

    model = setId(model, t, notify);

    if (t['@height'] !== undefined) {
      model = model.with({ height: t['@height'] });
    }
    if (t['@width'] !== undefined) {
      model = model.with({ width: t['@width'] });
    }

    getChildren(t).forEach((item) => {

      const key = getKey(item);
      const id = createGuid();

      switch (key) {
        case 'title':
          model = model.with({ title: item['title']['#text'] });
          break;
        case 'source':
          model = model.with({ source: item['source']['#text'] });
          break;
        case 'assets':
          model = model.with({ assets: item['assets']['#array'].map(asset =>
            Asset.fromPersistence(asset, id, notify)) });
          break;
        default:

      }
    });

    return model;
  }

  toPersistence(): Object {

    const children = [
      {
        title: {
          '#text': this.title,
        },
      },
      {
        source: {
          '#text': this.source,
        },
      },
      {
        assets: {
          '#array': this.assets.map(a => a.toPersistence()).toArray(),
        },
      },
    ];

    return {
      embed_activity: {
        '@id': this.id ? this.id : createGuid(),
        '@height': this.height,
        '@width': this.width,
        '#array': children,
      },
    };
  }
}
