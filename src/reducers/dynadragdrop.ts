import { Record } from 'immutable';
import {
  SelectInitiatorAction,
  SELECT_INITIATOR,
  ClearInitiatorAction,
  CLEAR_INITIATOR,
} from 'actions/dynadragdrop';
import { OtherAction } from './utils';
import { isNullOrUndefined } from 'util';

export type ActionTypes = SelectInitiatorAction | ClearInitiatorAction | OtherAction;
export type DynaDragDrop = Map<string, string>;

interface DynaDragDropStateParams {
  selectedInitiator: string;
}

const initialState = {
  selectedInitiator: null,
};

export class DynaDragDropState extends Record(initialState) {
  selectedInitiator: string;

  constructor(params?: DynaDragDropStateParams) {
    super(params);
  }

  with(values: DynaDragDropStateParams) {
    return this.merge(values) as this;
  }
}

export const dynadragdrop = (
  state: DynaDragDropState = new DynaDragDropState(),
  action: ActionTypes,
): DynaDragDropState => {
  switch (action.type) {
    case SELECT_INITIATOR:
      return state.with({ selectedInitiator: action.guid });
    case CLEAR_INITIATOR:
      return state.with({ selectedInitiator: null });
    default:
      return state;
  }
};
