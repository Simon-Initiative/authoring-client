import { connect } from 'react-redux';
import * as contentTypes from 'data/contentTypes';
import { QuestionProps } from './Question';
import { MultipartInput, PartAddPredicate } from './MultipartInput';
import { State } from 'reducers';
import { ActiveContext } from 'types/active';
import { setActiveItemIdActionAction } from 'actions/inputRef';
import { Maybe } from 'tsmonad';

interface StateProps {
  activeContext: ActiveContext;
  selectedInput: Maybe<string>;
}

interface DispatchProps {
  setActiveItemIdActionAction: (activeItemId: string) => void;
}

interface OwnProps extends QuestionProps<contentTypes.QuestionItem> {
  canInsertAnotherPart: PartAddPredicate;
  onAddItemPart: (item, part, body) => void;
}

const mapStateToProps = (state: State, ownProps: OwnProps): StateProps => {
  return {
    activeContext: state.activeContext,
    selectedInput: state.inputRef,
  };
};

const mapDispatchToProps = (dispatch): DispatchProps => {
  return {
    setActiveItemIdActionAction: (activeItemId: string) =>
      dispatch(setActiveItemIdActionAction(activeItemId)),
  };
};

export const controller = connect<StateProps, DispatchProps, OwnProps>
    (mapStateToProps, mapDispatchToProps)(MultipartInput);

export { controller as MultipartInput };
