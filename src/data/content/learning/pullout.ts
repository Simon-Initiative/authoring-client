import * as Immutable from 'immutable';

import createGuid from '../../../utils/guid';
import { augment, getChildren, except } from '../common';
import { getKey } from '../../common';
import { Title } from '../learning/title';
import { Orientation } from 'data/content/learning/common';
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

function fromStr(value: string): Maybe<PulloutType> {
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
  id?: string,
  title?: Title,
  orient?: Orientation,
  content?: ContentElements,
  pulloutType?: Maybe<PulloutType>,
  guid?: string,
};

const defaultContent = {
  contentType: 'Pullout',
  elementType: 'pullout',
  id: '',
  title: Title.fromText('Title'),
  orient: Orientation.Horizontal,
  pulloutType: Maybe.nothing(),
  content: new ContentElements().with({ supportedElements: Immutable.List<string>(BOX_ELEMENTS) }),
  guid: '',
};

export class Pullout extends Immutable.Record(defaultContent) {
  contentType: 'Pullout';
  elementType: 'pullout';
  id: string;
  title: Title;
  orient: Orientation;
  content: ContentElements;
  pulloutType: Maybe<PulloutType>;
  guid: string;

  constructor(params?: PulloutParams) {
    super(augment(params));
  }

  with(values: PulloutParams) {
    return this.merge(values) as this;
  }

  clone(): Pullout {
    return this.with({
      id: createGuid(),
      content: this.content.clone(),
      title: this.title.clone(),
    });
  }

  static fromPersistence(root: Object, guid: string): Pullout {
    const t = (root as any).pullout;

    let model = new Pullout({ guid });

    if (t['@id']) {
      model = model.with({ id: t['@id'] });
    } else {
      model = model.with({ id: createGuid() });
    }
    if (t['@orient'] !== undefined) {
      model = model.with({
        orient: t['@orient'] === 'vertical'
          ? Orientation.Vertical
          : Orientation.Horizontal,
      });
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

    model = model.with({
      content: ContentElements
        .fromPersistence(except(getChildren(t), 'title'), '', BOX_ELEMENTS),
    });

    return model;
  }

  toPersistence(): Object {

    const content = this.content.content.size === 0
      ? [{ p: { '#text': ' ' } }]
      : this.content.toPersistence();

    const s = {
      pullout: {
        '@id': this.id ? this.id : createGuid(),
        '@orient': this.orient,
        '#array': [
          this.title.toPersistence(),
          ...content,
        ],
      },
    };

    this.pulloutType.lift(p => s.pullout['@type'] = p);

    return s;
  }
}
