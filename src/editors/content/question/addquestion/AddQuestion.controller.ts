import { connect, Dispatch } from 'react-redux';
import { State } from 'reducers';
import { AddQuestion } from './AddQuestion';
import { CombinationsMap, PermutationsMap } from 'types/combinations';
import { computeCombinations, computePermutations } from 'actions/choices';
import { AssessmentType } from 'data/types';
import { Node } from 'data/models';

interface StateProps {

}

interface DispatchProps {
  onGetChoiceCombinations: (comboNum: number) => CombinationsMap;
  onGetChoicePermutations: (comboNum: number) => PermutationsMap;
}

interface OwnProps {
  editMode: boolean;
  assessmentType: AssessmentType;
  isBranching?: boolean;
  onQuestionAdd: (question: Node) => void;
}

const mapStateToProps = (state: State, ownProps: OwnProps): StateProps => {
  return {

  };
};

const mapDispatchToProps = (dispatch: Dispatch<State>, ownProps: OwnProps): DispatchProps => {
  return {
    onGetChoiceCombinations: (comboNum: number): CombinationsMap => {
      return dispatch(computeCombinations(comboNum));
    },
    onGetChoicePermutations: (comboNum: number): PermutationsMap => {
      return dispatch(computePermutations(comboNum));
    },
  };
};

export const controller = connect<StateProps, DispatchProps, OwnProps>
    (mapStateToProps, mapDispatchToProps)(AddQuestion);

export { controller as AddQuestion };
