import { connect, Dispatch } from 'react-redux';
import { State } from 'reducers';
import { OrgDetailsEditor } from './OrgDetailsEditor';
import * as models from 'data/models';

interface StateProps {

}

interface DispatchProps {

}

interface OwnProps {
  model: models.OrganizationModel;
}

const mapStateToProps = (state: State, ownProps: OwnProps): StateProps => {
  return {

  };
};

const mapDispatchToProps = (dispatch: Dispatch<State>, ownProps: OwnProps): DispatchProps => {
  return {

  };
};

export const controller = connect<StateProps, DispatchProps, OwnProps>
    (mapStateToProps, mapDispatchToProps)(OrgDetailsEditor);

export { controller as OrgDetailsEditor };
