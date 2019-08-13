import * as React from 'react';
import './404.scss';
import { connect, Dispatch } from 'react-redux';
import { State } from 'reducers';

import { reportError } from 'utils/feedback';
import { UserState } from 'reducers/user';

export interface FourZeroFourProps {
  user: UserState;
}

const FourZeroFour: React.StatelessComponent<FourZeroFourProps> = ({
  user,
}) => {
  return (
    <div className="404">
      <div className="global-content">
        <div>
          <span>
            <i className="far fa-frown fa-4x"></i>
          </span>
        </div>
        <p>
          Oh no! This page cannot be found.
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

interface StateProps {
  user: UserState;
}

interface DispatchProps {

}

interface OwnProps {
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
  (mapStateToProps, mapDispatchToProps)(FourZeroFour);

export { controller as FourZeroFour };
