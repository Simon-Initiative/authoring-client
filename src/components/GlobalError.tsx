import { useState, useEffect } from 'react';
// tslint:disable-next-line
import * as React from 'react';
import { withStyles, classNames } from 'styles/jss';
import { StyledComponentProps } from 'types/component';
import { styles } from './GlobalError.styles';
import { connect, Dispatch } from 'react-redux';
import { State } from 'reducers';

import { reportError } from 'utils/feedback';
import { UserState } from 'reducers/user';

export interface GlobalErrorProps {
  error: any;
  info: any;
  user: UserState;
  email: string;
}

const GlobalError:
  React.StatelessComponent<StyledComponentProps<GlobalErrorProps, typeof styles>> = ({
    classes, user, error,
  }) => {

    useEffect(() => {
      // Report this error to the console
      console.error(error);
    });

    const [reported, setReported] = useState(false);
    useEffect(() => {
      // Report this error event to google analytics
      if (!reported) {
        (window as any).gtag('event', 'exception', { description: error, fatal: true });
        setReported(true);
      }
    });

    return (
      <div className={classNames([classes.globalError])}>

        <div className={classNames([classes.globalContent])}>

          <div>
            <span>
              <i className="far fa-frown fa-4x"></i>
            </span>
          </div>

          <p>
            Oh no! Something went wrong.
        </p>

          <p>
            Refreshing your browser and trying again may
            fix the problem.
        </p>

          <button
            onClick={() => reportError(user)}
            className="btn btn-primary">
            Report this problem
        </button>

        </div>

      </div>
    );

  };

const StyledGlobalError = withStyles<GlobalErrorProps>(styles)(GlobalError);

interface StateProps {
  user: UserState;
}

interface DispatchProps {

}

interface OwnProps {
  error: any;
  info: any;
}

const mapStateToProps = (state: State, ownProps: OwnProps): StateProps => {
  return {
    user: state.user,
  };
};

const mapDispatchToProps = (dispatch: Dispatch<State>, ownProps: OwnProps): DispatchProps => {
  return {

  };
};

export const controller = connect<StateProps, DispatchProps, OwnProps>
  (mapStateToProps, mapDispatchToProps)(StyledGlobalError);

export { controller as GlobalError };
