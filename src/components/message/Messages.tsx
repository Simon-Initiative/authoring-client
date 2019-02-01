import * as React from 'react';
import * as Immutable from 'immutable';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

import { Message as Msg, MessageAction, Severity } from 'types/messages';
import { Message } from './Message';

import './Messages.scss';

export interface MessagesProps {
  dismissMessage: (message: Msg) => void;
  executeAction: (message: Msg, action: MessageAction) => void;
  messages: Immutable.OrderedMap<string, Msg>;
}

export interface MessagesState {

}

// Chooses the message with the highest priority, or the most recently triggered
// message given matching priorities
function highestPriority(
  messages: Immutable.OrderedMap<string, Msg>, severity: Severity)
  : Msg[] {

  const last = messages
    .filter(m => m.severity === severity)
    .sortBy(m => m.priority)
    .toOrderedMap()
    .last();

  return last ? [last] : [];
}

export class Messages
  extends React.PureComponent<MessagesProps, MessagesState> {

  constructor(props) {
    super(props);
  }


  render(): JSX.Element {

    // Only display one instance of each message severity at a time

    const errors = highestPriority(this.props.messages, Severity.Error);
    const warnings = highestPriority(this.props.messages, Severity.Warning);
    const infos = highestPriority(this.props.messages, Severity.Information);
    const tasks = highestPriority(this.props.messages, Severity.Task);

    const messages = [...errors, ...warnings, ...infos, ...tasks];

    return (
      <div className="messages">
        <ReactCSSTransitionGroup transitionName="message"
          transitionEnterTimeout={250} transitionLeaveTimeout={250}>
          {messages.map(m => <Message key={m.guid} {...this.props} message={m} />)}
        </ReactCSSTransitionGroup>
      </div>
    );

  }

}

