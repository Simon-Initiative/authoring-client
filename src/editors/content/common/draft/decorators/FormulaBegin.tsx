import * as React from 'react';
import { byType, Decorator } from './common';
import { EntityTypes } from '../../../../../data/content/learning/common';

class FormulaBegin extends React.PureComponent<any, any> {

  render() : JSX.Element {
    return (
      <span data-offset-key={this.props.offsetKey}>
        &rarr;
      </span>
    );
  }
}

export default function (props: Object) : Decorator {
  return {
    strategy: byType.bind(undefined, EntityTypes.formula_begin),
    component: FormulaBegin,
    props,
  };
}
