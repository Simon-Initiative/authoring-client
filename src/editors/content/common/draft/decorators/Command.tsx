import * as React from 'react';
import { byType, Decorator } from './common';
import { EntityTypes } from '../../../../../data/content/learning/common';
import './styles.scss';

class Command extends React.Component<any, any> {

  constructor(props) {
    super(props);
  }


  render(): JSX.Element {
    return (
      <span
        data-offset-key={this.props.offsetKey}
        className="command">
        {this.props.children}
      </span>
    );
  }
}

export default function (props: Object): Decorator {
  return {
    strategy: byType.bind(undefined, EntityTypes.command),
    component: Command,
    props,
  };
}
