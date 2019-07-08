
import * as Immutable from 'immutable';
import { Entry } from 'data/content/bibtek/entry';
import { WorkbookPageModel } from 'data/models';
import { mapAndSave } from 'actions/document';
import { DocumentId } from 'data/types';
export type SET_ORDERED_IDS = 'SET_ORDERED_IDS';
export const SET_ORDERED_IDS = 'SET_ORDERED_IDS';


export type SetOrderedIdsAction = {
  type: SET_ORDERED_IDS,
  orderedIds: Immutable.Map<string, number>,
};

export function setOrderedIds(
  orderedIds: Immutable.Map<string, number>): SetOrderedIdsAction {
  return {
    type: SET_ORDERED_IDS,
    orderedIds,
  };
}


export function addEntry(entry: Entry, documentId: DocumentId) {

  const insertEntry = (e) => {
    if ('WorkbookPageModel' === e.modelType) {
      const m = e as WorkbookPageModel;
      const bibEntries = m.bibliography.bibEntries.set(entry.guid, entry);
      const bibliography = m.bibliography.with({ bibEntries });
      return m.with({ bibliography });
    }
    return e;
  };

  return mapAndSave(insertEntry, documentId);

}

