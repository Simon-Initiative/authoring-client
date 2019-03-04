import * as React from 'react';
import { StyledComponentProps } from 'types/component';
import { injectSheetSFC, classNames, JSSStyles } from 'styles/jss';
import colors from 'styles/colors';
import { EditorSidebarState } from 'reducers/editorSidebar';

const styles: JSSStyles = {
  SidebarToggle: {
    width: 30,
    height: 30,
    borderRadius: '50%',
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1000,
    color: colors.grayDark,
    border: [2, 'solid', colors.grayDark],
    background: colors.white,
    paddingRight: 3,
    textAlign: 'center',
    cursor: 'pointer',
    boxShadow: [2, 3, 10, -2, 'rgba(148,148,148,1)'],

    '& i': {
      fontWeight: 600,
    },

    '&:hover': {
      color: colors.selection,
      border: [2, 'solid', colors.selection],
    },
  },
};

export interface SidebarToggleProps {
  className?: string;
  editorSidebar: EditorSidebarState;
  onToggleSidebar: (show: boolean) => void;
}

/**
 * SidebarToggle React Stateless Component
 */
export const SidebarToggle = injectSheetSFC<SidebarToggleProps>(styles)(({
  className, classes, editorSidebar, onToggleSidebar,
}: StyledComponentProps<SidebarToggleProps>) => {
  return !editorSidebar.show && (
    <div
      className={classNames(['SidebarToggle', classes.SidebarToggle, className])}
      onClick={(e) => {
        onToggleSidebar(!editorSidebar.show);
        e.stopPropagation();
      }}>
      <i className="fa fa-angle-double-left" />
    </div>
  );
});
