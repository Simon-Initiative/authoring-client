import * as Immutable from 'immutable';
import { augment, ensureIdGuidPresent, setId } from '../common';

export type AssetParams = {
  guid?: string,
  name?: string,
  text?: string,
};

const defaultContent = {
  textType: 'Asset',
  elementType: 'asset',
  guid: '',
  name: '',
  text: '',
};

export class Asset extends Immutable.Record(defaultContent) {

  textType: 'Asset';
  elementType: 'asset';
  guid: string;
  name: string;
  text: string;

  constructor(params?: AssetParams) {
    super(augment(params, true));
  }

  with(values: AssetParams) {
    return this.merge(values) as this;
  }

  clone(): Asset {
    return ensureIdGuidPresent(this);
  }

  static fromPersistence(root: Object, guid: string, notify: () => void): Asset {

    const t = (root as any).asset;

    let model = new Asset({ guid });

    model = setId(model, t, notify);

    if (t['@name'] !== undefined) {
      model = model.with({ name: t['@name'] });
    }
    if (t['#text'] !== undefined) {
      model = model.with({ text: t['#text'] });
    }

    return model;
  }

  toPersistence(): Object {
    return {
      asset: {
        '@name': this.name,
        '#text': this.text,
      },
    };
  }
}
