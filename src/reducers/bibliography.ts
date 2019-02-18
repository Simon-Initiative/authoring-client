import { Map } from 'immutable';

import {
  SET_ORDERED_IDS, SetOrderedIdsAction,
} from 'actions/bibliography';
import { OtherAction } from './utils';

export type BibliographyActions = SetOrderedIdsAction | OtherAction;
export type BibliographyState = Map<string, number>;

const initialState: BibliographyState = Map<string, number>();

export const orderedIds = (
  state: BibliographyState = initialState,
  action: BibliographyActions,
): BibliographyState => {
  switch (action.type) {
    case SET_ORDERED_IDS:
      return action.orderedIds;
    default:
      return state;
  }
};
