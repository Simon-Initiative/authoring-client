import { connect, Dispatch } from 'react-redux';
import { State } from 'reducers';
import { DynaDropTarget } from './DynaDropTarget';
import { Initiator as InitiatorModel } from 'data/content/assessment/dragdrop/initiator';

interface StateProps {

}

interface DispatchProps {

}

interface OwnProps {
  id: string;
  assessmentId: string;
  label: string;
  initiators: InitiatorModel[];
  editMode: boolean;
  className?: string;
  header?: boolean;
  onDrop: (initiatorId: string, targetAssessmentId: string) => void;
  onRemoveInitiator: (initiatorId: string, targetAssessmentId: string) => void;
}

const mapStateToProps = (state: State, ownProps: OwnProps): StateProps => {
  return {
    selectedTarget: state.dynadragdrop.selectedInitiator,
  };
};

const mapDispatchToProps = (dispatch: Dispatch<State>, ownProps: OwnProps): DispatchProps => {
  return {

  };
};

export const controller = connect<StateProps, DispatchProps, OwnProps>
    (mapStateToProps, mapDispatchToProps)(DynaDropTarget);

export { controller as DynaDropTarget };
