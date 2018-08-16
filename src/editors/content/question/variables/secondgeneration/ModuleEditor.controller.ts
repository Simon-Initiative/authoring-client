import { connect, Dispatch } from 'react-redux';
import { ModuleEditor } from
  'editors/content/question/variables/secondgeneration/ModuleEditor';
import { State } from 'reducers';

interface StateProps {

}

interface DispatchProps {
}

interface OwnProps {

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
    (mapStateToProps, mapDispatchToProps)(ModuleEditor);

export { controller as ModuleEditor };
