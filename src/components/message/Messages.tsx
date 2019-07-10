import * as React from 'react';
import * as Immutable from 'immutable';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import { Message as Msg, Scope, MessageAction, Severity } from 'types/messages';
import { Message } from './Message';
import './Messages.scss';
import { RouterState } from 'reducers/router';

export interface MessagesProps {
  dismissMessage: (message: Msg) => void;
  executeAction: (message: Msg, action: MessageAction) => void;
  messages: Immutable.OrderedMap<string, Msg>;
  router: RouterState;
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
    const { router } = this.props;

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
          {messages.filter((m) => {
            const { route } = router;

            switch (m.scope) {
              case Scope.Organization:
                return route.type === 'RouteCourse' &&
                  route.orgId.caseOf({ just: _ => true, nothing: () => false });
              case Scope.PackageDetails:
                return route.type === 'RouteCourse' && route.route.type === 'RouteCourseOverview';
              case Scope.Resource:
                return route.type === 'RouteCourse' && route.route.type === 'RouteResource';
              case Scope.CoursePackage:
                return route.type === 'RouteCourse';
              case Scope.Application:
              default:
                return true;
            }
          }).map(m => <Message key={m.guid} {...this.props} message={m} />)}
        </ReactCSSTransitionGroup>
      </div>
    );

  }

}

