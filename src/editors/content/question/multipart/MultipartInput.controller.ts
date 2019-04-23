import { connect } from 'react-redux';
import * as contentTypes from 'data/contentTypes';
import { QuestionProps } from '../question/Question';
import { MultipartInput, PartAddPredicate } from './MultipartInput';
import { State } from 'reducers';
import { ActiveContext } from 'types/active';
import { setActiveItemIdActionAction } from 'actions/inputRef';
import { Maybe } from 'tsmonad';
import { RouterState } from 'reducers/router';
import { clearSearchParam } from 'actions/router';

interface StateProps {
  activeContext: ActiveContext;
  selectedInput: Maybe<string>;
  router: RouterState;
}

interface DispatchProps {
  setActiveItemIdActionAction: (activeItemId: string) => void;
  onClearSearchParam: (name) => void;
}

interface OwnProps extends QuestionProps<contentTypes.QuestionItem> {
  canInsertAnotherPart: PartAddPredicate;
  onAddItemPart: (item, part, body) => void;
}

const mapStateToProps = (state: State, ownProps: OwnProps): StateProps => {
  return {
    activeContext: state.activeContext,
    selectedInput: state.inputRef,
    router: state.router,
  };
};

const mapDispatchToProps = (dispatch): DispatchProps => {
  return {
    setActiveItemIdActionAction: (activeItemId: string) =>
      dispatch(setActiveItemIdActionAction(activeItemId)),
    onClearSearchParam: name => dispatch(clearSearchParam(name)),
  };
};

export const controller = connect<StateProps, DispatchProps, OwnProps>
  (mapStateToProps, mapDispatchToProps)(MultipartInput);

export { controller as MultipartInput };
