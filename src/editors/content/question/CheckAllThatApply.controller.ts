import { connect } from 'react-redux';
import * as Immutable from 'immutable';
import * as contentTypes from 'data/contentTypes';
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

interface OwnProps {
  onBodyEdit: (...args: any[]) => any;
  body: any;
  grading: any;
  onGradingChange: (value) => void;
  hideGradingCriteria: boolean;
  allSkills: Immutable.OrderedMap<string, Skill>;
  model: contentTypes.Question;
  onRemoveQuestion: () => void;
  itemModel: contentTypes.MultipleChoice;
  partModel: contentTypes.Part;
  onEdit: (item: contentTypes.MultipleChoice, part: contentTypes.Part) => void;
  context: AppContext;
  services: AppServices;
  editMode: boolean;
  onFocus: (itemId: string) => void;
  onBlur: (itemId: string) => void;
  onRemove: (item: contentTypes.MultipleChoice, part: contentTypes.Part) => void;
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
