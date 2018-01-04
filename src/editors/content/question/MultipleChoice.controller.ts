import { connect } from 'react-redux';
import { Map, OrderedMap } from 'immutable';
import { MultipleChoice } from './MultipleChoice';
import * as contentTypes from 'data/contentTypes';
import { toggleAdvancedScoring } from 'actions/questionEditor';
import { State } from 'reducers';
import { QuestionProps } from './Question';

interface StateProps {
  advScoringInit: boolean;
  advancedScoring: boolean;
}

interface DispatchProps {
  onToggleAdvancedScoring: (id: string, value?: boolean) => void;
}

interface OwnProps extends QuestionProps<contentTypes.MultipleChoice> {

}

const mapStateToProps = (state: State, props: OwnProps): StateProps => {
  return {
    advScoringInit: state.questionEditor.hasIn(['scoring', props.model.guid]),
    advancedScoring: state.questionEditor.getIn(['scoring', props.model.guid]),
  };
};

const mapDispatchToProps = (dispatch): DispatchProps => {
  return {
    onToggleAdvancedScoring: (id: string, value?: boolean) => {
      dispatch(toggleAdvancedScoring(id, value));
    },
  };
};

export const controller = connect<StateProps, DispatchProps, OwnProps>
    (mapStateToProps, mapDispatchToProps)(MultipleChoice);

export { controller as MultipleChoice };
