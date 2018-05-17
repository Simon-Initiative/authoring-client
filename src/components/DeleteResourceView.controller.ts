import { connect, Dispatch } from 'react-redux';
import { State } from 'reducers';
import DeleteResourceView from './DeleteResourceView';
import { Resource } from 'data/contentTypes';
import { Maybe } from 'tsmonad/lib/src';

export type miniResourceRef = {
  resourceId: string;
  guid: string;
};

interface StateProps {
  references: Maybe<miniResourceRef>;
}

interface DispatchProps {

}

interface OwnProps {
  onCancel: () => void;
  onDelete: () => void;
  resource: Resource;
}

const mapStateToProps = (state: State, ownProps: OwnProps): StateProps => {
  return {
    resourceRefs: state.resourceRefs,
  };
};

const mapDispatchToProps = (dispatch: Dispatch<State>, ownProps: OwnProps): DispatchProps => {
  return {

  };
};

export const controller = connect<StateProps, DispatchProps, OwnProps>
    (mapStateToProps, mapDispatchToProps)(DeleteResourceView);

export { controller as DeleteResourceView };
