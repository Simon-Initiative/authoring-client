import { connect } from 'react-redux';
import * as Immutable from 'immutable';
import * as Messages from 'types/messages';
import { Messages as MessageContainer } from './Messages';
import { dismissSpecificMessage } from 'actions/messages';

interface StateProps {
  messages: Immutable.OrderedMap<string, Messages.Message>;
}

interface DispatchProps {
  dismissMessage: (message: Messages.Message) => void;
  executeAction: (message: Messages.Message, action: Messages.MessageAction) => void;
}

interface OwnProps {
}

const mapStateToProps = (state, ownProps: OwnProps): StateProps => {
  const {
    messages,
  } = state;

  return {
    messages,
  };
};

const mapDispatchToProps = (dispatch): DispatchProps => {
  return {
    dismissMessage: (message: Messages.Message) => {
      dispatch(dismissSpecificMessage(message));
    },
    executeAction: (message: Messages.Message, action: Messages.MessageAction) => {
      action.execute(message, dispatch);
    },
  };
};

export default connect<StateProps, DispatchProps, OwnProps>
  (mapStateToProps, mapDispatchToProps)(MessageContainer);
