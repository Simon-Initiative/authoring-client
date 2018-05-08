import * as Immutable from 'immutable';

import createGuid from '../../../utils/guid';
import { augment, getChildren } from '../common';
import { Cr, ConjugationCell } from './cr';
import { CellHeader } from './cellheader';
import { Conjugate } from './conjugate';
import { getKey } from '../../common';
import { Title } from '../learning/title';
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
  id: '',
  contentType: 'Conjugation',
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
  id: string;
  contentType: 'Conjugation';
  verb: string;
  title: Title;
  pronunciation: Maybe<Pronunciation>;
  rows: Immutable.OrderedMap<string, Cr>;
  guid: string;

  constructor(params?: ConjugationParams) {
    super(augment(params));
  }

  with(values: ConjugationParams) {
    return this.merge(values) as this;
  }

  clone() : Conjugation {
    return this.with({
      id: createGuid(),
      rows: this.rows.map(r => r.clone().with({ guid: createGuid() })).toOrderedMap(),
    });
  }


  static fromPersistence(root: Object, guid: string) : Conjugation {

    const t = (root as any).conjugation;

    let model = new Conjugation({ guid });

    if (t['@id'] !== undefined) {
      model = model.with({ id: t['@id'] });
    } else {
      model = model.with({ id: createGuid() });
    }
    if (t['@verb'] !== undefined) {
      model = model.with({ verb: t['@verb'] });
    }

    getChildren(t).forEach((item) => {

      const key = getKey(item);
      const id = createGuid();

      switch (key) {
        case 'cr':
          model = model.with({ rows: model.rows.set(id, Cr.fromPersistence(item, id)) });
          break;
        case 'title':
          model = model.with({ title: Title.fromPersistence(item, id) });
          break;
        case 'pronunciation':
          model = model.with(
            { pronunciation: Maybe.just(Pronunciation.fromPersistence(item, id)) });
          break;
        default:

      }
    });


    return model;
  }

  toPersistence() : Object {

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
        '@id': this.id,
        '@verb': this.verb,
        '#array': children,
      },
    };
  }
}
