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
  show?: boolean;
  sidebarContent?: JSX.Element;
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
      return state.with({ show: action.show });
    case SET_SIDEBAR_CONTENT:
      return state.set('sidebarContent', action.sidebarContent) as EditorSidebarState;
    case RESET_SIDEBAR_CONTENT:
      return state.set('sidebarContent', undefined) as EditorSidebarState;
    default:
      return state;
  }
};
