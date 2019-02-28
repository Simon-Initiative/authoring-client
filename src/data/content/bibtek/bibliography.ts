import * as Immutable from 'immutable';

import createGuid from '../../../utils/guid';
import { augment, getChildren, ensureIdGuidPresent } from '../common';

import {
  Entry, fromPersistence as entryFromPersistence,
  toPersistence as entryToPersistence,
} from './entry';

export type BibliographyParams = {
  bibEntries?: Immutable.OrderedMap<string, Entry>,
  guid?: string,
};

const defaultContent = {
  contentType: 'Bibliography',
  elementType: 'bib:file',
  bibEntries: Immutable.OrderedMap<string, Entry>(),
  guid: '',
};

export class Bibliography extends Immutable.Record(defaultContent) {

  contentType: 'Bibliography';
  elementType: 'bib:file';
  bibEntries: Immutable.OrderedMap<string, Entry>;
  guid: string;

  constructor(params?: BibliographyParams) {
    super(augment(params));
  }

  with(values: BibliographyParams) {
    return this.merge(values) as this;
  }

  clone(): Bibliography {
    return ensureIdGuidPresent(this.with({
      bibEntries: this.bibEntries.mapEntries(([_, v]) => {
        const clone: Entry = v.clone();
        return [clone.guid, clone];
      }).toOrderedMap() as Immutable.OrderedMap<string, Entry>,
    }));
  }

  static fromPersistence(root: Object, guid: string, notify: () => void): Bibliography {

    const bib = (root as any)['bib:file'];

    // handle case where bib is an empty element
    if (Object.keys(bib).length === 0) return new Bibliography();

    const entries = getChildren(bib).map((item) => {
      const entry = entryFromPersistence(item, createGuid(), notify);
      return [entry.guid, entry];
    });

    return new Bibliography().with({ bibEntries: Immutable.OrderedMap<string, Entry>(entries) });
  }

  toPersistence(): Object {
    return {
      'bib:file': {
        '#array': this.bibEntries.toArray().map(p => entryToPersistence(p)),
      },
    };
  }
}
