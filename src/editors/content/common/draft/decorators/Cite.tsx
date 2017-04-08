import * as React from 'react';
import { Decorator, byType } from './common';
import { EntityTypes } from '../custom';


class Cite extends React.PureComponent<any, any> {

  a: any;

  componentDidMount() {
    (window as any).$(this.a).tooltip();
  }

  render() : JSX.Element {
    const data = this.props.contentState.getEntity(this.props.entityKey).getData();
    const entry = data['@entry'];
    return (
      <u ref={(a) => this.a = a} data-toggle="tooltip" data-placement="top" title={entry} >
        {this.props.children}
      </u>
    );
  }
}


const decorator : Decorator = {
  
  strategy: byType.bind(undefined, EntityTypes.cite),
  
  component: Cite

};

export default decorator;