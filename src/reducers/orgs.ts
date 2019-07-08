import * as Immutable from 'immutable';
import {
  ORG_REQUESTED, ORG_LOADED, ORG_CHANGE_FAILED, MODEL_UPDATED,
  ORG_CHANGE_SUCCEEDED, CHANGE_SELECTED_ITEM, RELEASE_ORG,
  CHANGE_REDONE, CHANGE_UNDONE, CHANGE_PROCESSED,
  REQUEST_INITIATED,
  RequestInitiatedAction,
  ChangeProcessedAction,
  ChangeSelectedItemAction,
  OrgChangeSucceededAction, ReleaseOrgAction,
  ChangeRedoneAction, ChangeUndoneAction,
  OrgChangeFailedAction, OrgLoadedAction, OrgRequestedAction, ModelUpdatedAction,
} from 'actions/orgs';
import {
  UpdateRouteAction,
  UPDATE_ROUTE_ACTION,
} from 'actions/router';
import { OtherAction } from './utils';
import { Document } from 'data/persistence';
import { Maybe } from 'tsmonad';
import { NavigationItem, makePackageOverview } from 'types/navigation';
import * as org from 'data/models/utils/org';
import { OrganizationModel } from 'data/models';
import { DocumentId } from 'data/types';

type ActionTypes =
  OrgChangeFailedAction | OrgChangeSucceededAction | ReleaseOrgAction |
  OrgLoadedAction | OrgRequestedAction | ModelUpdatedAction | RequestInitiatedAction |
  ChangeRedoneAction | ChangeUndoneAction | UpdateRouteAction |
  ChangeSelectedItemAction | ChangeProcessedAction | OtherAction;

export type OrgsState = {
  activeOrg: Maybe<Document>,
  placements: Immutable.OrderedMap<string, org.Placement>,
  lastChangeSucceeded: boolean,
  documentId: Maybe<DocumentId>,
  selectedItem: NavigationItem,
  undoStack: Immutable.Stack<org.OrgChangeRequest>,
  redoStack: Immutable.Stack<org.OrgChangeRequest>,
  requestInFlight: boolean,
};

const initialState = {
  activeOrg: Maybe.nothing<Document>(),
  placements: Immutable.OrderedMap<string, org.Placement>(),
  lastChangeSucceeded: true,
  documentId: Maybe.nothing<DocumentId>(),
  selectedItem: makePackageOverview(),
  undoStack: Immutable.Stack<org.OrgChangeRequest>(),
  redoStack: Immutable.Stack<org.OrgChangeRequest>(),
  requestInFlight: false,
};


function processChange(
  state: OrgsState, action: ChangeProcessedAction): OrgsState {

  const undoStack = state.undoStack.push(action.cr);
  const redoStack = Immutable.Stack<org.OrgChangeRequest>();
  return Object.assign({}, state, { undoStack, redoStack });
}


function processUndo(
  state: OrgsState, action: ChangeUndoneAction): OrgsState {

  const undoStack = state.undoStack.pop();
  const redoStack = state.redoStack.push(action.cr);
  return Object.assign({}, state, { undoStack, redoStack });
}

function processRedo(
  state: OrgsState, action: ChangeRedoneAction): OrgsState {

  const redoStack = state.redoStack.pop();
  const undoStack = state.undoStack.push(action.cr);
  return Object.assign({}, state, { redoStack, undoStack });
}


export const orgs = (
  state: OrgsState = initialState,
  action: ActionTypes,
): OrgsState => {
  switch (action.type) {
    case REQUEST_INITIATED:
      return Object.assign({}, state, { requestInFlight: true });
    // On any route change, we reset the undo/redo stacks
    case UPDATE_ROUTE_ACTION:
      return Object.assign({}, state, {
        undoStack: Immutable.Stack<org.OrgChangeRequest>(),
        redoStack: Immutable.Stack<org.OrgChangeRequest>(),
      });
    case CHANGE_REDONE:
      return processRedo(state, action);
    case CHANGE_PROCESSED:
      return processChange(state, action);
    case CHANGE_UNDONE:
      return processUndo(state, action);
    case RELEASE_ORG:
      return Object.assign({}, state, { activeOrg: Maybe.nothing() });
    case CHANGE_SELECTED_ITEM:
      return Object.assign({}, state, { selectedItem: action.selectedItem });
    case MODEL_UPDATED: {
      const activeOrg = state.activeOrg.caseOf({
        just: d => Maybe.just(d.with({ model: action.model })),
        nothing: () => Maybe.nothing(),
      });
      const placements = org.modelToPlacements(action.model);
      return Object.assign({}, state, { activeOrg, placements });
    }
    case ORG_REQUESTED:
      return Object.assign({}, state, { documentId: Maybe.just(action.orgId) });
    case ORG_LOADED: {
      const undoStack = Immutable.Stack<org.OrgChangeRequest>();
      const redoStack = Immutable.Stack<org.OrgChangeRequest>();
      const placements = org.modelToPlacements(action.document.model as OrganizationModel);
      return Object.assign(
        {}, state, { activeOrg: Maybe.just(action.document), undoStack, redoStack, placements });
    }
    case ORG_CHANGE_FAILED:
      return Object.assign({}, state, { lastChangeSucceeded: false, requestInFlight: false });
    case ORG_CHANGE_SUCCEEDED:
      return Object.assign({}, state, { lastChangeSucceeded: true, requestInFlight: false });
    default:
      return state;
  }
};
