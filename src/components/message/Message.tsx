import * as React from 'react';
import * as Messages from 'types/messages';


export interface MessageProps {
  message: Messages.Message;
}

export interface MessageState {

}



export class Message
  extends React.PureComponent<MessageProps, MessageState> {

  constructor(props) {
    super(props);
  }

  render() : JSX.Element {
    return (
      <nav className="navbar navbar-inverse bg-primary">

      </nav>
    );

  }

}

