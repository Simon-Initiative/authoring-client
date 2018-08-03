import { connect } from 'react-redux';
import * as contentTypes from 'data/contentTypes';
import { QuestionProps } from './Question';
import { Ordering } from './Ordering';
import { PermutationsMap } from 'types/combinations';
import { computePermutations } from 'actions/choices';
import { toggleAdvancedScoring } from 'actions/questionEditor';

interface StateProps {
  advancedScoringInitialized: boolean;
  advancedScoring: boolean;
}

interface DispatchProps {
  onGetChoicePermutations: (comboNum: number) => PermutationsMap;
  onToggleAdvancedScoring: (id: string, value?: boolean) => void;
}

interface OwnProps extends QuestionProps<contentTypes.Ordering> {

}

const mapStateToProps = (state, ownProps: OwnProps): StateProps => {
  return {
    advancedScoringInitialized: state.questionEditor.hasIn(['scoring', ownProps.model.guid]),
    advancedScoring: state.questionEditor.getIn(['scoring', ownProps.model.guid]),
  };
};

const mapDispatchToProps = (dispatch): DispatchProps => {
  return {
    onGetChoicePermutations: (comboNum: number): PermutationsMap => {
      return dispatch(computePermutations(comboNum));
    },
    onToggleAdvancedScoring: (id: string, value?: boolean) => {
      dispatch(toggleAdvancedScoring(id, value));
    },
  };
};

export const controller = connect<StateProps, DispatchProps, OwnProps>
    (mapStateToProps, mapDispatchToProps)(Ordering);

export { controller as Ordering };
