import { connect } from 'react-redux';
import * as contentTypes from 'data/contentTypes';
import { QuestionProps } from './Question';
import { Ordering } from './Ordering';
import { PermutationsMap } from 'types/combinations';
import { computePermutations } from 'actions/choices';

interface StateProps {

}

interface DispatchProps {
  onGetChoicePermutations: (comboNum: number) => PermutationsMap;
}

interface OwnProps extends QuestionProps<contentTypes.Ordering> {

}

const mapStateToProps = (state, ownProps: OwnProps): StateProps => {
  return {

  };
};

const mapDispatchToProps = (dispatch): DispatchProps => {
  return {
    onGetChoicePermutations: (comboNum: number): PermutationsMap => {
      return dispatch(computePermutations(comboNum));
    },
  };
};

export const controller = connect<StateProps, DispatchProps, OwnProps>
    (mapStateToProps, mapDispatchToProps)(Ordering);

export { controller as Ordering };
