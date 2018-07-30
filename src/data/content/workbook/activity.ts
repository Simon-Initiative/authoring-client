import * as Immutable from 'immutable';
import createGuid from 'utils/guid';
import { augment, getChildren, ensureIdGuidPresent } from 'data/content/common';
import { getKey } from 'data/common';
import { Image } from 'data/content/learning/image';
import { Maybe } from 'tsmonad';

export type ActivityParams = {
  idref?: string,
  purpose?: Maybe<string>,
  image?: Maybe<Image>,
  guid?: string,
};

const defaultContent = {
  contentType: 'Activity',
  elementType: 'activity',
  idref: '',
  purpose: Maybe.nothing<string>(),
  image: Maybe.nothing<Image>(),
  guid: '',
};

export class Activity extends Immutable.Record(defaultContent) {
  contentType: 'Activity';
  elementType: 'activity';
  idref: string;
  purpose: Maybe<string>;
  image: Maybe<Image>;
  guid: string;

  constructor(params?: ActivityParams) {
    super(augment(params));
  }

  with(values: ActivityParams) {
    return this.merge(values) as this;
  }

  clone() : Activity {
    return ensureIdGuidPresent(this.with({
      image: this.image.lift(i => i.clone()),
    }));
  }

  static fromPersistence(root: Object, guid: string, notify: () => void) : Activity {
    const t = (root as any).activity;

    let model = new Activity({ guid });

    if (t['@idref'] !== undefined) {
      model = model.with({ idref: t['@idref'] });
    }
    if (t['@purpose'] !== undefined) {
      model = model.with({ purpose: Maybe.just(t['@purpose']) });
    }

    getChildren(t).forEach((item) => {

      const key = getKey(item);
      const id = createGuid();

      switch (key) {
        case 'image':
          model = model.with({ image: Maybe.just(Image.fromPersistence(item, id, notify)) });
          break;
        default:
      }
    });

    return model;
  }

  toPersistence() : Object {
    const activity = {
      activity: {
        '@idref': this.idref,
        '#array': this.image.caseOf({
          just: i => [i.toPersistence],
          nothing: () => [],
        }),
      },
    };
    this.purpose.lift(p => activity.activity['@purpose'] = p);
    return activity;
  }
}
