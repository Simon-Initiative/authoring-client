import * as Immutable from 'immutable';
import createGuid from 'utils/guid';
import { augment, getChildren, ensureIdGuidPresent, setId } from 'data/content/common';
import { Cr, ConjugationCell } from 'data/content/learning/cr';
import { CellHeader } from 'data/content/learning/cellheader';
import { getKey } from 'data/common';
import { Title } from 'data/content/learning/title';
import { Pronunciation, ContiguousText } from 'data/contentTypes';
import { Maybe } from 'tsmonad';

export type ConjugationParams = {
  id?: string,
  verb?: string,
  title?: Title,
  pronunciation?: Maybe<Pronunciation>,
  rows?: Immutable.OrderedMap<string, Cr>,
  guid?: string,
};

const defaultContent = {
  contentType: 'Conjugation',
  elementType: 'conjugation',
  id: '',
  verb: '',
  pronunciation: Maybe.nothing(),
  title: Title.fromText('Title'),
  rows: Immutable.OrderedMap<string, Cr>(),
  guid: '',
};

function createDefaultRows() {
  const cell = new CellHeader().with({ guid: createGuid() });
  const cells = Immutable.OrderedMap<string, ConjugationCell>().set(cell.guid, cell);
  const row = new Cr().with({ cells, guid: createGuid() });
  return Immutable.OrderedMap<string, Cr>().set(row.guid, row);
}

export class Conjugation extends Immutable.Record(defaultContent) {
  contentType: 'Conjugation';
  elementType: 'conjugation';
  id: string;
  verb: string;
  title: Title;
  pronunciation: Maybe<Pronunciation>;
  rows: Immutable.OrderedMap<string, Cr>;
  guid: string;

  constructor(params?: ConjugationParams) {
    super(augment(params, true));
  }

  with(values: ConjugationParams) {
    return this.merge(values) as this;
  }

  clone(): Conjugation {
    return ensureIdGuidPresent(this.with({
      title: this.title.clone(),
      pronunciation: this.pronunciation.caseOf({
        just: p => Maybe.just(p.clone()),
        nothing: () => Maybe.nothing<Pronunciation>(),
      }),
      rows: this.rows.mapEntries(([_, v]) => {
        const clone: Cr = v.clone();
        return [clone.guid, clone];
      }).toOrderedMap() as Immutable.OrderedMap<string, Cr>,
    }));
  }

  static fromPersistence(root: Object, guid: string, notify: () => void): Conjugation {

    const t = (root as any).conjugation;

    let model = new Conjugation({ guid });

    model = setId(model, t, notify);

    if (t['@verb'] !== undefined) {
      model = model.with({ verb: t['@verb'] });
    }

    getChildren(t).forEach((item) => {

      const key = getKey(item);
      const id = createGuid();

      switch (key) {
        case 'cr':
          model = model.with({ rows: model.rows.set(id, Cr.fromPersistence(item, id, notify)) });
          break;
        case 'title':
          model = model.with({ title: Title.fromPersistence(item, id, notify) });
          break;
        case 'pronunciation':
          model = model.with(
            { pronunciation: Maybe.just(Pronunciation.fromPersistence(item, id, notify)) });
          break;
        default:

      }
    });

    return model;
  }

  toPersistence(): Object {

    const children = [];

    (this.title.text.content.first() as ContiguousText)
      .extractPlainText()
      .lift(text => text !== '' && text !== 'Title'
        ? children.push(this.title.toPersistence())
        : undefined);

    this.pronunciation.lift(p => children.push(p.toPersistence()));

    this.rows.size === 0
      ? createDefaultRows().toArray().forEach(p => children.push(p.toPersistence()))
      : this.rows.toArray().forEach(p => children.push(p.toPersistence()));

    return {
      conjugation: {
        '@id': this.id ? this.id : createGuid(),
        '@verb': this.verb,
        '#array': children,
      },
    };
  }
}
