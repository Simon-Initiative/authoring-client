import { connect } from 'react-redux';
import * as contentTypes from 'data/contentTypes';
import { QuestionProps } from './Question';
import { MultipartInput, PartAddPredicate } from './MultipartInput';
import { State } from 'reducers';
import { ActiveContext } from 'types/active';

interface StateProps {
  activeContext: ActiveContext;
}

interface DispatchProps {

}

interface OwnProps extends QuestionProps<contentTypes.QuestionItem> {
  canInsertAnotherPart: PartAddPredicate;
  onAddItemPart: (item, part, body) => void;
}

const mapStateToProps = (state: State, ownProps: OwnProps): StateProps => {
  return {
    activeContext: state.activeContext,
  };
};

const mapDispatchToProps = (dispatch): DispatchProps => {
  return {};
};

export const controller = connect<StateProps, DispatchProps, OwnProps>
    (mapStateToProps, mapDispatchToProps)(MultipartInput);

export { controller as MultipartInput };
