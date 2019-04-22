import * as React from 'react';
import { StyledComponentProps } from 'types/component';
import { withStyles, classNames } from 'styles/jss';

import { styles } from './LoadingSpinner.styles';

export enum LoadingSpinnerSize {
  Small,
  Normal,
  Large,
}

export interface LoadingSpinnerProps {
  className?: string;
  failed?: boolean;
  message?: string;
  size?: LoadingSpinnerSize;
}

export interface LoadingSpinnerState {

}

/**
 * LoadingSpinner React Component
 */
class LoadingSpinner
  extends React.PureComponent<StyledComponentProps<LoadingSpinnerProps, typeof styles>,
  LoadingSpinnerState> {

  constructor(props) {
    super(props);
  }

  render() {
    const { className, classes, message, failed, children, size } = this.props;

    const sizeClass = size === LoadingSpinnerSize.Small
      ? classes.sizeSmall
      : size === LoadingSpinnerSize.Large
      ? classes.sizeLarge
      : classes.sizeNormal;

    return (
      <div className={classNames(['LoadingSpinner', classes.LoadingSpinner, sizeClass, className])}>
        {failed
          ? <i className="fa fa-times-circle" />
          : <i className="fas fa-circle-notch fa-spin fa-1x fa-fw" />}
        &nbsp;{message ? message : children}
      </div>
    );
  }
}

const StyledLoadingSpinner = withStyles<LoadingSpinnerProps>(styles)(LoadingSpinner);
export { StyledLoadingSpinner as LoadingSpinner };
