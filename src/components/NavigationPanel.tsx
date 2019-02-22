import * as React from 'react';
import { StyledComponentProps } from 'types/component';
import { injectSheet, classNames, JSSStyles } from 'styles/jss';
import { Maybe } from 'tsmonad';
import colors from 'styles/colors';
import { Dropdown, DropdownItem } from 'editors/content/common/Dropdown';

const DEFAULT_WIDTH_PX = 300;

export const styles: JSSStyles = {
  NavigationPanel: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: colors.grayLightest,
    borderRight: [1, 'solid', colors.grayLight],
    padding: [10, 0],
  },
  navItem: {
    fontSize: '1.2em',
    fontWeight: 500,
    margin: [5, 5],
    padding: [5, 15],
    borderRadius: 6,
    cursor: 'pointer',

    '& i': {
      width: 40,
      textAlign: 'center',
    },

    '&:hover': {
      backgroundColor: colors.grayLighter,
    },
  },
};

export interface NavigationPanelProps {
  className?: string;
}

export interface NavigationPanelState {
  collapsed: boolean;
  maybeWidth: Maybe<number>;
}

/**
 * NavigationPanel React Component
 */
@injectSheet(styles)
export class NavigationPanel
    extends React.PureComponent<StyledComponentProps<NavigationPanelProps>,
    NavigationPanelState> {

  constructor(props) {
    super(props);

    this.state = {
      collapsed: false,
      maybeWidth: Maybe.nothing(),
    };
  }

  getWidth = () => {
    const { collapsed, maybeWidth } = this.state;
    return collapsed
      ? 80
      : maybeWidth.valueOr(DEFAULT_WIDTH_PX);
  }

  render() {
    const { className, classes } = this.props;

    return (
      <div
        className={classNames(['NavigationPanel', classes.NavigationPanel, className])}
        style={{ width: this.getWidth() }}>
        <a className={classes.navItem}>
          <i className="fa fa-book" /> Overview
        </a>
        <a className={classes.navItem}>
          <i className="fa fa-graduation-cap" /> Objectives
        </a>
        <a className={classes.navItem}>
          <i className="fa fa-th-list" /> Organization
        </a>
        <Dropdown label="Default Organization">
          <DropdownItem label="Default Organization" onClick={() => {}} />
        </Dropdown>
      </div>
    );
  }
}
