// Show Sidebar
export type SHOW_SIDEBAR = 'editorSidebar/SHOW_SIDEBAR';
export const SHOW_SIDEBAR: SHOW_SIDEBAR = 'editorSidebar/SHOW_SIDEBAR';

export type ShowSidebarAction = {
  type: SHOW_SIDEBAR,
  show: boolean,
};

export const showSidebar = (show: boolean): ShowSidebarAction => ({
  type: SHOW_SIDEBAR,
  show,
});

// Set Sidebar Content
export type SET_SIDEBAR_CONTENT = 'editorSidebar/SET_SIDEBAR_CONTENT';
export const SET_SIDEBAR_CONTENT: SET_SIDEBAR_CONTENT = 'editorSidebar/SET_SIDEBAR_CONTENT';

export type SetSidebarContentAction = {
  type: SET_SIDEBAR_CONTENT,
  sidebarContent: JSX.Element,
};

export const setSidebarContent = (sidebarContent: JSX.Element):
  SetSidebarContentAction => {
  return {
    type: SET_SIDEBAR_CONTENT,
    sidebarContent,
  };
};

// Reset Sidebar Content
export type RESET_SIDEBAR_CONTENT = 'editorSidebar/RESET_SIDEBAR_CONTENT';
export const RESET_SIDEBAR_CONTENT: RESET_SIDEBAR_CONTENT = 'editorSidebar/RESET_SIDEBAR_CONTENT';

export type ResetSidebarContentAction = {
  type: RESET_SIDEBAR_CONTENT,
};

export const resetSidebarContent = (): ResetSidebarContentAction => ({
  type: RESET_SIDEBAR_CONTENT,
});
