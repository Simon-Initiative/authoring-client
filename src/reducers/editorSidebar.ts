import { Record } from 'immutable';
import {
  ShowSidebarAction,
  SHOW_SIDEBAR,
  SET_SIDEBAR_CONTENT,
  RESET_SIDEBAR_CONTENT,
  SetSidebarContentAction,
  ResetSidebarContentAction,
} from 'actions/editorSidebar';
import { OtherAction } from './utils';

export type ActionTypes =
  ShowSidebarAction |
  SetSidebarContentAction |
  ResetSidebarContentAction |
  OtherAction;

interface EditorSidebarStateParams {
  show: boolean;
  sidebarContent: JSX.Element;
}

const initialState = {
  show: true,
  sidebarContent: undefined,
};

export class EditorSidebarState extends Record(initialState) {
  show: boolean;
  sidebarContent: JSX.Element;

  constructor(params?: EditorSidebarStateParams) {
    super(params);
  }

  with(values: EditorSidebarStateParams) {
    return this.merge(values) as this;
  }
}

export const editorSidebar = (
  state: EditorSidebarState = new EditorSidebarState(),
  action: ActionTypes,
): EditorSidebarState => {
  switch (action.type) {
    case SHOW_SIDEBAR:
      return Object.assign({}, state, { show: action.show });
    case SET_SIDEBAR_CONTENT:
      return Object.assign({}, state, { sidebarContent: action.sidebarContent });
    case RESET_SIDEBAR_CONTENT:
      return Object.assign({}, state, { sidebarContent: undefined });
    default:
      return state;
  }
};
