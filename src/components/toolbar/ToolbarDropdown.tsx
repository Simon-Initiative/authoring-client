import * as React from 'react';
import { withStyles, classNames } from 'styles/jss';
import { styles } from './ToolbarDropdown.styles';
import { StyledComponentProps } from 'types/component';

export enum ToolbarDropdownSize {
  Large = 'large',
  Small = 'small',
  Tiny = 'tiny',
  Wide = 'wide',
}

export interface ToolbarDropdownProps {
  className?: string;
  size?: ToolbarDropdownSize;
  selected?: boolean;
  label: JSX.Element;
  hideArrow?: boolean;
  positionMenuOnRight?: boolean;
}

class ToolbarDropdown
  extends React.PureComponent<StyledComponentProps<ToolbarDropdownProps, typeof styles>> {

  constructor(props) {
    super(props);
  }

  render() {
    const {
      className, classes, selected,
      size = ToolbarDropdownSize.Small,
      positionMenuOnRight = true,
      label, hideArrow,
    } = this.props;

    const menuClasses = positionMenuOnRight
      ? 'dropdown-menu dropdown-menu-right'
      : 'dropdown-menu';

    return (
      <div className={classNames([classes.toolbarDropdown, 'dropdown'])}>
        <button
            className={
              classNames([classes.toolbarDropdownButton, size,
                className, selected ? 'selected' : ''])}
            data-toggle={'dropdown'}
            type="button">
          {label}
          {!hideArrow && <i className="droparrow fa fa-caret-down"/>}
        </button>
        <div className={menuClasses}>
          {this.props.children}
        </div>
      </div>
    );
  }
}

const StyledToolbarDropdown = withStyles<ToolbarDropdownProps>(styles)(ToolbarDropdown);
export { StyledToolbarDropdown as ToolbarDropdown };
