import * as Immutable from 'immutable';
import { augment, ensureIdGuidPresent, setId } from '../common';
import { Maybe } from 'tsmonad';

export type AssetParams = {
  guid?: string,
  name?: string,
  src?: string,
  content?: Maybe<string>;
};

const defaultContent = {
  textType: 'Asset',
  elementType: 'asset',
  guid: '',
  name: '',
  src: '',
  content: Maybe.nothing<string>(),
};

export class Asset extends Immutable.Record(defaultContent) {

  textType: 'Asset';
  elementType: 'asset';
  guid: string;
  name: string;
  src: string;
  content: Maybe<string>;

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

    if (t['@name'] !== undefined) {
      model = model.with({ name: t['@name'] });
    }
    if (t['#text'] !== undefined) {
      model = model.with({ src: t['#text'] });
    }
    if (t['content'] !== undefined) {
      model = model.with({ content: Maybe.just(t['content']) });
    }

    return model;
  }

  toPersistence(): Object {
    return {
      asset: {
        '@name': this.name,
        '#text': this.src,
        content: this.content.caseOf({
          just: content => content,
          nothing: () => undefined,
        }),
      },
    };
  }
}
