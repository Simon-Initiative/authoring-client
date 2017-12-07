import * as React from 'react';
import * as Immutable from 'immutable';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

import { Message as Msg, Severity, MessageAction } from 'types/messages';
import { Message } from './message';

import './Messages.scss';

export interface MessagesProps {
  dismissMessage: (message: Msg) => void;
  executeAction: (message: Msg, action: MessageAction) => void;
  messages: Immutable.OrderedMap<string, Msg>;
}

export interface MessagesState {

}

function mostRecent(
  messages: Immutable.OrderedMap<string, Msg>, severity: Severity)
  : Msg[] {

  const last = messages
    .filter(m => m.severity === severity)
    .toOrderedMap()
    .last();

  return last ? [last] : [];
}


export class Messages
  extends React.PureComponent<MessagesProps, MessagesState> {

  constructor(props) {
    super(props);
  }


  render() : JSX.Element {

    // Only display one instance of each message severity at a time

    const errors = mostRecent(this.props.messages, Severity.Error);
    const warnings = mostRecent(this.props.messages, Severity.Warning);
    const infos = mostRecent(this.props.messages, Severity.Information);

    const messages = [...errors, ...warnings, ...infos];

    return (
      <div>
        <ReactCSSTransitionGroup transitionName="message"
        transitionEnterTimeout={500} transitionLeaveTimeout={300}>
          {messages.map(m => <Message key={m.guid} {...this.props} message={m}/>)}
        </ReactCSSTransitionGroup>
      </div>
    );

  }

}

