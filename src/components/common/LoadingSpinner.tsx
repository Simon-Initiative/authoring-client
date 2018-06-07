import * as React from 'react';
import * as Immutable from 'immutable';
import { StyledComponentProps } from 'types/component';
import { injectSheet, classNames, JSSProps } from 'styles/jss';

import { styles } from './LoadingSpinner.styles';

export interface LoadingSpinnerProps {
  className?: string;
  failed?: boolean;
  message: string;
}

export interface LoadingSpinnerState {

}

/**
 * LoadingSpinner React Component
 */
@injectSheet(styles)
export class LoadingSpinner
  extends React.PureComponent<StyledComponentProps<LoadingSpinnerProps>,
  LoadingSpinnerState> {

  constructor(props) {
    super(props);
  }

  render() {
    const { className, classes, children, message, failed } = this.props;

    return (
      <div className={classNames(['LoadingSpinner', classes.LoadingSpinner, className])}>
        {failed
          ? <i className="fa fa-times-circle" />
          : <i className="fa fa-circle-o-notch fa-spin fa-1x fa-fw" />}
        &nbsp;{message}
      </div>
    );
  }
}
