import { connect } from 'react-redux';
import * as contentTypes from 'data/contentTypes';
import { QuestionProps } from '../question/Question';
import { DynaDropInput } from './DynaDropInput';
import { State } from 'reducers';
import { ActiveContext } from 'types/active';
import { toggleAdvancedScoring } from 'actions/questionEditor';

interface StateProps {
  activeContext: ActiveContext;
  selectedInitiator: string;
  advancedScoringInitialized: boolean;
  advancedScoring: boolean;
}

interface DispatchProps {
  onToggleAdvancedScoring: (id: string, value?: boolean) => void;
}

interface OwnProps extends QuestionProps<contentTypes.QuestionItem> {
  onAddItemPart: (item, part, body) => void;
}

const mapStateToProps = (state: State, ownProps: OwnProps): StateProps => {
  return {
    activeContext: state.activeContext,
    selectedInitiator: state.dynadragdrop.selectedInitiator,
    advancedScoringInitialized: state.questionEditor.hasIn(['scoring', ownProps.model.guid]),
    advancedScoring: state.questionEditor.getIn(['scoring', ownProps.model.guid]),
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
  (mapStateToProps, mapDispatchToProps)(DynaDropInput);

export { controller as DynaDropInput };
