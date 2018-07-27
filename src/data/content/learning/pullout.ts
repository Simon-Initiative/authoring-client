import * as Immutable from 'immutable';
import createGuid from 'utils/guid';
import { augment, getChildren, except, ensureIdGuidPresent, setId } from 'data/content/common';
import { getKey } from 'data/common';
import { Title } from 'data/content/learning/title';
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
    super(augment(params, true));
  }

  with(values: PulloutParams) {
    return this.merge(values) as this;
  }

  clone(): Pullout {
    return ensureIdGuidPresent(this.with({
      content: this.content.clone(),
      title: this.title.clone(),
    }));
  }

  static fromPersistence(root: Object, guid: string, notify: () => void): Pullout {
    const t = (root as any).pullout;

    let model = new Pullout({ guid });

    model = setId(model, t, notify);

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
          model = model.with({ title: Title.fromPersistence(item, id, notify) });
          break;
        default:
      }
    });

    model = model.with({
      content: ContentElements
        .fromPersistence(except(getChildren(t), 'title'), '', BOX_ELEMENTS, null, notify),
    });

    return model;
  }

  toPersistence(): Object {

    const encoded = this.content.toPersistence();
    const content = encoded.length === 0 ? [{
      p: {
        '#text': ' ',
        '@id': createGuid(),
      },
    }] : encoded;

    const s = {
      pullout: {
        '@id': this.id || createGuid(),
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
