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
