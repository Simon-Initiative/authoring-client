import * as React from 'react';
import { StyledComponentProps } from 'types/component';
import { withStyles, classNames, JSSStyles } from 'styles/jss';
import colors from 'styles/colors';
import { EditorSidebarState } from 'reducers/editorSidebar';
import { Tooltip } from 'utils/tooltip';

const styles: JSSStyles = {
  SidebarToggle: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1000,
  },
  toggleButton: {
    width: 30,
    height: 30,
    borderRadius: '50%',
    color: colors.grayDark,
    border: [1, 'solid', colors.grayDark],
    background: colors.white,
    paddingRight: 2,
    paddingTop: 2,
    textAlign: 'center',
    cursor: 'pointer',
    boxShadow: [1, 3, 10, -2, 'rgba(148,148,148,1)'],
    fontSize: 16,

    '& i': {
      fontWeight: 600,
    },

    '&:hover': {
      color: colors.selection,
      border: [1, 'solid', colors.selection],
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
const SidebarToggle:
React.StatelessComponent<StyledComponentProps<SidebarToggleProps, typeof styles>> = ({
  className, classes, editorSidebar, onToggleSidebar,
}) => {
  return !editorSidebar.show && (
    <div
      className={classNames(['SidebarToggle', classes.SidebarToggle, className])}>
      <Tooltip title="Show Sidebar" position="left" size="small" delay={750}>
        <div className={classes.toggleButton}
          onClick={(e) => {
            onToggleSidebar(!editorSidebar.show);
            e.stopPropagation();
          }}>
          <i className="fa fa-angle-double-left" />
        </div>
      </Tooltip>
    </div>
  );
};

const StyledSidebarToggle = withStyles<SidebarToggleProps>(styles)(SidebarToggle);
export { StyledSidebarToggle as SidebarToggle };
