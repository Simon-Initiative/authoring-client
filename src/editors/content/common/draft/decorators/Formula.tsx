import * as React from 'react';
import { Decorator, byType } from './common';
import { EntityTypes } from '../custom';
import { Math } from '../../../../../utils/math/Math';


class Formula extends React.PureComponent<any, any> {

  render() : JSX.Element {
    const data = this.props.contentState.getEntity(this.props.entityKey).getData();
    const math = data["#cdata"];
    console.log(this.props);
    return (
      <span data-offset-key={this.props.offsetKey}>
        <Math inline>{math}</Math>
      </span>
    );
  }
}


export default function(props: Object) : Decorator {
  return {
    strategy: byType.bind(undefined, EntityTypes.formula),
    component: Formula,
    props
  };
};