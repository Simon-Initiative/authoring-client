import * as React from 'react';
import { Decorator, byType } from './common';
import { EntityTypes } from '../../../../../data/content/html/common';


class Cite extends React.PureComponent<any, any> {

  a: any;

  componentDidMount() {
    (window as any).$(this.a).tooltip();
  }

  render() : JSX.Element {
    const data = this.props.contentState.getEntity(this.props.entityKey).getData();
    const entry = data['@entry'];
    return (
      <u data-offset-key={this.props.offsetKey} ref={(a) => this.a = a} data-toggle="tooltip" data-placement="top" title={entry} >
        {this.props.children}
      </u>
    );
  }
}

export default function(props: Object) : Decorator {
  return {
    strategy: byType.bind(undefined, EntityTypes.cite),
    component: Cite,
    props
  };
};
