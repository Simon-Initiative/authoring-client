import { connect, Dispatch } from 'react-redux';
import { State } from 'reducers';
import CodeBlockEditor from './CodeBlockEditor';
import { DiscoverableId } from 'types/discoverable';
import { discover } from 'actions/discoverable';

interface StateProps {

}

interface DispatchProps {
  onDiscover: (id: DiscoverableId) => void;
}

interface OwnProps {

}

const mapStateToProps = (state: State, ownProps: OwnProps): StateProps => {
  return {

  };
};

const mapDispatchToProps = (dispatch: Dispatch<State>, ownProps: OwnProps): DispatchProps => {
  return {
    onDiscover: (id: DiscoverableId) => {
      dispatch(discover(id));
    },
  };
};

export const controller = connect<StateProps, DispatchProps, OwnProps>
    (mapStateToProps, mapDispatchToProps)(CodeBlockEditor);

export { controller as CodeBlockEditor };
