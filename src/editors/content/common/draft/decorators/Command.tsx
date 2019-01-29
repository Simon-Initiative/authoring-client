import * as React from 'react';
import { byType, Decorator } from './common';
import { EntityTypes } from '../../../../../data/content/learning/common';
import { Command as CommandData } from 'data/content/learning/command';
import { StyledInlineEntity } from './StyledInlineEntity';

import './styles.scss';

class Command extends React.PureComponent<any, any> {

  constructor(props) {
    super(props);
  }


  render(): JSX.Element {
    const data = this.props.contentState.getEntity(this.props.entityKey).getData();

    return (
      <span
        data-offset-key={this.props.offsetKey}
        className="command">
        Command
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
