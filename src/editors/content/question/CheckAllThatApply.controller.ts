import { connect } from 'react-redux';
import * as Immutable from 'immutable';
import { MultipleChoice } from './MultipleChoice';
import * as contentTypes from 'data/contentTypes';
import { QuestionProps } from './Question';
import { Skill } from 'types/course';
import { AppServices } from '../../common/AppServices';
import { AppContext } from '../../common/AppContext';
import { CheckAllThatApply } from './CheckAllThatApply';
import { CombinationsMap } from 'types/combinations';
import { computeCombinations } from 'actions/choices';
import { toggleAdvancedScoring } from 'actions/questionEditor';
import { State } from 'reducers';

interface StateProps {
  advancedScoringInitialized: boolean;
  advancedScoring: boolean;
}

interface DispatchProps {
  onGetChoiceCombinations: (comboNum: number) => CombinationsMap;
  onToggleAdvancedScoring: (id: string, value?: boolean) => void;
}

interface OwnProps extends QuestionProps<contentTypes.MultipleChoice> {

}

const mapStateToProps = (state: State, ownProps: OwnProps): StateProps => {
  return {
    advancedScoringInitialized: state.questionEditor.hasIn(['scoring', ownProps.model.guid]),
    advancedScoring: state.questionEditor.getIn(['scoring', ownProps.model.guid]),
  };
};

const mapDispatchToProps = (dispatch): DispatchProps => {
  return {
    onGetChoiceCombinations: (comboNum: number): CombinationsMap => {
      return dispatch(computeCombinations(comboNum));
    },
    onToggleAdvancedScoring: (id: string, value?: boolean) => {
      dispatch(toggleAdvancedScoring(id, value));
    },
  };
};

export const controller = connect<StateProps, DispatchProps, OwnProps>
    (mapStateToProps, mapDispatchToProps)(CheckAllThatApply);

export { controller as CheckAllThatApply };
