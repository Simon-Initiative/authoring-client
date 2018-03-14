import * as Immutable from 'immutable';

import createGuid from '../../../utils/guid';
import { augment, getChildren } from '../common';
import { getKey } from '../../common';
import { Image } from '../learning/image';
import { Maybe } from 'tsmonad';

export type ActivityParams = {
  idref?: string,
  purpose?: string,
  image?: Maybe<Image>,
  guid?: string,
};

const defaultContent = {
  contentType: 'Activity',
  idref: '',
  purpose: 'checkpoint',
  image: Maybe.nothing<Image>(),
  guid: '',
};

export class Activity extends Immutable.Record(defaultContent) {
  contentType: 'Activity';
  idref: string;
  purpose: string;
  image: Maybe<Image>;
  guid: string;

  constructor(params?: ActivityParams) {
    super(augment(params));
  }

  with(values: ActivityParams) {
    return this.merge(values) as this;
  }

  clone() : Activity {
    return this.with({
      image: this.image.caseOf(
        { just: i => Maybe.just(i.clone()), nothing: () => Maybe.nothing<Image>() }),
    });
  }

  static fromPersistence(root: Object, guid: string) : Activity {
    const t = (root as any).activity;

    let model = new Activity({ guid });

    if (t['@idref'] !== undefined) {
      model = model.with({ idref: t['@idref'] });
    }
    if (t['@purpose'] !== undefined) {
      model = model.with({ purpose: t['@purpose'] });
    }

    getChildren(t).forEach((item) => {

      const key = getKey(item);
      const id = createGuid();

      switch (key) {
        case 'image':
          model = model.with({ image: Maybe.just(Image.fromPersistence(item, id)) });
          break;
        default:
      }
    });

    return model;
  }

  toPersistence() : Object {
    return {
      activity: {
        '@idref': this.idref,
        '@purpose': this.purpose,
        '#array': this.image.caseOf({
          just: i => [i.toPersistence],
          nothing: () => [],
        }),
      },
    };
  }
}
