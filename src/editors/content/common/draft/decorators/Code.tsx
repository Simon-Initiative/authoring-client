import * as React from 'react';
import { byType, Decorator } from './common';
import { EntityTypes } from '../../../../../data/content/learning/common';

class Code extends React.PureComponent<any, any> {

  render() : JSX.Element {
    return (
      <code data-offset-key={this.props.offsetKey}>
        {this.props.children}
      </code>
    );
  }
}

export default function (props: Object) : Decorator {
  return {
    strategy: byType.bind(undefined, EntityTypes.code),
    component: Code,
    props,
  };
}
