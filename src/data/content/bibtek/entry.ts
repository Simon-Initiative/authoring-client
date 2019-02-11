import { Article } from './article';
import { Book } from './book';
import { Booklet } from './booklet';
import { InBook } from './inbook';
import { InCollection } from './incollection';
import { InProceedings } from './inproceedings';
import { Conference } from './conference';
import { Manual } from './manual';
import { MastersThesis } from './mastersthesis';
import { PhdThesis } from './phdthesis';
import { Proceedings } from './proceedings';
import { Misc } from './misc';
import { Unpublished } from './unpublished';
import { TechReport } from './techreport';
import { Unsupported } from '../unsupported';

import createGuid from 'utils/guid';

export type Entry =
  Article | Book | Booklet | InBook | Misc | TechReport | Unpublished |
  InCollection | InProceedings | Conference | Manual | MastersThesis | PhdThesis;

export function fromPersistence(root: Object, guid: string, notify: () => void): Entry {
  const entry = root['bib:entry'];
  let kind = null;
  if (entry['bib:article'] !== undefined) {
    kind = Article.fromPersistence(entry, createGuid(), notify);
  } else if (entry['bib:book'] !== undefined) {
    kind = Book.fromPersistence(entry, createGuid(), notify);
  } else if (entry['bib:booklet'] !== undefined) {
    kind = Booklet.fromPersistence(entry, createGuid(), notify);
  } else if (entry['bib:incollection'] !== undefined) {
    kind = InCollection.fromPersistence(entry, createGuid(), notify);
  } else if (entry['bib:inbook'] !== undefined) {
    kind = InBook.fromPersistence(entry, createGuid(), notify);
  } else if (entry['bib:inproceedings'] !== undefined) {
    kind = InProceedings.fromPersistence(entry, createGuid(), notify);
  } else if (entry['bib:conference'] !== undefined) {
    kind = Conference.fromPersistence(entry, createGuid(), notify);
  } else if (entry['bib:manual'] !== undefined) {
    kind = Manual.fromPersistence(entry, createGuid(), notify);
  } else if (entry['bib:mastersthesis'] !== undefined) {
    kind = MastersThesis.fromPersistence(entry, createGuid(), notify);
  } else if (entry['bib:phdthesis'] !== undefined) {
    kind = PhdThesis.fromPersistence(entry, createGuid(), notify);
  } else if (entry['bib:misc'] !== undefined) {
    kind = Misc.fromPersistence(entry, createGuid(), notify);
  } else if (entry['bib:proceedings'] !== undefined) {
    kind = Proceedings.fromPersistence(entry, createGuid(), notify);
  } else if (entry['bib:unpublished'] !== undefined) {
    kind = Unpublished.fromPersistence(entry, createGuid(), notify);
  } else if (entry['bib:techreport'] !== undefined) {
    kind = TechReport.fromPersistence(entry, createGuid(), notify);

  } else {
    kind = Unsupported.fromPersistence(entry, createGuid(), notify);
  }

  return kind.with({ id: entry['@id'] });
}

export function toPersistence(entry: Entry): Object {
  const e = {
    'bib:entry': {
      '@id': entry.id,
    },
  };
  const o = entry.toPersistence();
  const firstKey = Object.keys(o)[0];
  e['bib:entry'][firstKey] = o[firstKey];

  return e;
}
