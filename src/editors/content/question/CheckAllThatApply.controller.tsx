import { connect } from 'react-redux';
import * as Immutable from 'immutable';
import * as contentTypes from 'data/contentTypes';
import { Skill } from 'types/course';
import { AppServices } from '../../common/AppServices';
import { AppContext } from '../../common/AppContext';
import { CheckAllThatApply, CheckAllThatApplyProps } from './CheckAllThatApply';
import { CombinationsMap } from 'types/combinations';
import { computeCombinations } from 'actions/choices';

interface StateProps {

}

interface DispatchProps {
  onGetChoiceCombinations: (comboNum: number) => CombinationsMap;
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

const mapStateToProps = (state, ownProps: OwnProps): StateProps => {
  return {

  };
};

const mapDispatchToProps = (dispatch): DispatchProps => {
  return {
    onGetChoiceCombinations: (comboNum: number): CombinationsMap => {
      return dispatch(computeCombinations(comboNum));
    },
  };
};

export const controller = connect<StateProps, DispatchProps, OwnProps>
    (mapStateToProps, mapDispatchToProps)(CheckAllThatApply);

export { controller as CheckAllThatApply };
