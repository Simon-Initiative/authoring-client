import { connect } from 'react-redux';
import * as contentTypes from 'data/contentTypes';
import { QuestionProps } from './Question';
import { DynaDropInput } from './DynaDropInput';
import { State } from 'reducers';
import { ActiveContext } from 'types/active';
import { selectInitiator } from 'actions/dynadragdrop';

interface StateProps {
  activeContext: ActiveContext;
  selectedInitiator: string;
}

interface DispatchProps {

}

interface OwnProps extends QuestionProps<contentTypes.QuestionItem> {
  onAddItemPart: (item, part, body) => void;
}

const mapStateToProps = (state: State, ownProps: OwnProps): StateProps => {
  return {
    activeContext: state.activeContext,
    selectedInitiator: state.dynadragdrop.selectedInitiator,
  };
};

const mapDispatchToProps = (dispatch): DispatchProps => {
  return {

  };
};

export const controller = connect<StateProps, DispatchProps, OwnProps>
    (mapStateToProps, mapDispatchToProps)(DynaDropInput);

export { controller as DynaDropInput };
