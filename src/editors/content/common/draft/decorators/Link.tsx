import * as React from 'react';
import { Decorator, byType } from './common';
import { EntityTypes } from '../../../../../data/content/html/common';

class Link extends React.PureComponent<any, any> {

  a: any;

  componentDidMount() {
    (window as any).$(this.a).tooltip();
  }

  render() : JSX.Element {
    const data = this.props.contentState.getEntity(this.props.entityKey).getData();
    const href = data['@href'];
    const target = data['@target'] === 'new' ? '_blank' : '_self';
    return (
      <a data-offset-key={this.props.offsetKey} ref={(a) => this.a = a} data-toggle="tooltip" data-placement="top" title={href} target={target} href={href}>
        {this.props.children}
      </a>
    );
  }
}

export default function(props: Object) : Decorator {
  return {
    strategy: byType.bind(undefined, EntityTypes.link),
    component: Link,
    props
  };
};