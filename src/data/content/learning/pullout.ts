import * as Immutable from 'immutable';

import createGuid from '../../../utils/guid';
import { augment, getChildren } from '../common';
import { getKey } from '../../common';
import { Title } from '../learning/title';

import { ContentElements, BOX_ELEMENTS } from 'data/content/common/elements';
import { Maybe } from 'tsmonad';

export enum PulloutType {
  Note = 'note',
  Notation = 'notation',
  Observation = 'observation',
  Research = 'research',
  Tip = 'tip',
  ToSumUp = 'tosumup',
}

function fromStr(value: string) : Maybe<PulloutType> {
  switch (value) {
    case 'note': return Maybe.just(PulloutType.Note);
    case 'notation': return Maybe.just(PulloutType.Notation);
    case 'observation': return Maybe.just(PulloutType.Observation);
    case 'research': return Maybe.just(PulloutType.Research);
    case 'tip': return Maybe.just(PulloutType.Tip);
    case 'tosumup': return Maybe.just(PulloutType.ToSumUp);
    default: return Maybe.nothing();
  }
}

export type PulloutParams = {
  id?: Maybe<string>,
  title?: Title,
  purpose?: Maybe<string>,
  content?: ContentElements,
  pulloutType?: Maybe<PulloutType>,
  guid?: string,
};

const defaultContent = {
  contentType: 'Pullout',
  id: Maybe.nothing(),
  title: new Title(),
  purpose: Maybe.nothing(),
  pulloutType: Maybe.nothing(),
  content: new ContentElements().with({ supportedElements: Immutable.List(BOX_ELEMENTS) }),
  guid: '',
};

export class Pullout extends Immutable.Record(defaultContent) {
  contentType: 'Pullout';
  id: Maybe<string>;
  title: Title;
  purpose: Maybe<string>;
  content: ContentElements;
  pulloutType: Maybe<PulloutType>;
  guid: string;

  constructor(params?: PulloutParams) {
    super(augment(params));
  }

  with(values: PulloutParams) {
    return this.merge(values) as this;
  }

  clone() : Pullout {
    return this.with({
      content: this.content.clone(),
      title: this.title.clone(),
    });
  }

  static fromPersistence(root: Object, guid: string) : Pullout {
    const t = (root as any).pullout;

    let model = new Pullout({ guid });

    if (t['@id'] !== undefined) {
      model = model.with({ id: Maybe.just(t['@id']) });
    }
    if (t['@purpose'] !== undefined) {
      model = model.with({ purpose: Maybe.just(t['@purpose']) });
    }
    if (t['@type'] !== undefined) {
      model = model.with({ pulloutType: fromStr(t['@type']) });
    }

    getChildren(t).forEach((item) => {

      const key = getKey(item);
      const id = createGuid();

      switch (key) {
        case 'title':
          model = model.with({ title: Title.fromPersistence(item, id) });
          break;
        default:
      }
    });

    debugger;

    model = model.with({ content: ContentElements
      .fromPersistence(getChildren(t), '', BOX_ELEMENTS) });

    return model;
  }

  toPersistence() : Object {
    const s = {
      pullout: {
        '#array': [
          this.title.toPersistence(),
          this.content.toPersistence(),
        ],
      },
    };

    this.id.lift(p => s.pullout['@id'] = p);
    this.purpose.lift(p => s.pullout['@purpose'] = p);
    this.pulloutType.lift(p => s.pullout['@type'] = p);

    return s;
  }
}
