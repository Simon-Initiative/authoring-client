import { connect } from 'react-redux';
import * as contentTypes from 'data/contentTypes';
import { QuestionProps } from './Question';
import { Ordering } from './Ordering';
import { CombinationsMap } from 'types/combinations';
import { computeCombinations } from 'actions/choices';

interface StateProps {

}

interface DispatchProps {
  onGetChoiceCombinations: (comboNum: number) => CombinationsMap;
}

interface OwnProps extends QuestionProps<contentTypes.Ordering> {

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
    (mapStateToProps, mapDispatchToProps)(Ordering);

export { controller as Ordering };
