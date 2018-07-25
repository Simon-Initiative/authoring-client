import { OtherAction } from 'reducers/utils';
import { SetXrefTargetAction, SET_TARGET, MissingTargetId } from 'actions/xref';
import { ContentElement } from 'data/content/common/interfaces';
import { Either } from 'tsmonad';

type XrefAction =
  SetXrefTargetAction |
  OtherAction;

// Undefined cross ref target indicates no target has ever been set.
// NotFoundError indicates an idref is set in the model, but cannot be found in the workbook page.
export type XrefState = {
  target: Either<MissingTargetId, ContentElement> | undefined;
};

const initialState: XrefState = {
  target: undefined,
};

export function xref(state: XrefState = initialState, action: XrefAction): XrefState {
  switch (action.type) {
    case SET_TARGET:
      return {
        target: action.target,
      };
    default:
      return state;
  }
}

