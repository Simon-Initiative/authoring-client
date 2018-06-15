import { Record } from 'immutable';
import {
  ShowSidebarAction,
  SHOW_SIDEBAR,
} from 'actions/editorSidebar';
import { OtherAction } from './utils';

export type ActionTypes = ShowSidebarAction | OtherAction;

interface EditorSidebarStateParams {
  show: boolean;
}

const initialState = {
  show: true,
};

export class EditorSidebarState extends Record(initialState) {
  show: boolean;

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
    default:
      return state;
  }
};
