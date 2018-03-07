import * as React from 'react';
import { byType, Decorator } from './common';
import { EntityTypes } from '../../../../../data/content/learning/common';
import { Math as MathRenderer } from '../../../../../utils/math/Math';
import { ContentState } from 'draft-js';

import { AppServices } from '../../../../common/AppServices';


interface Math {
  _onClick: any;
}

interface MathProps {

  services: AppServices;
  offsetKey: string;
  contentState: ContentState;
  entityKey: string;
  onEdit: (c: ContentState) => void;
}

class Math extends React.PureComponent<MathProps, any> {

  attribute: string;

  constructor(props) {
    super(props);
  }

  render() : JSX.Element {
    const data = this.props.contentState.getEntity(this.props.entityKey).getData();

    let math;
    if (data['#cdata'] !== undefined) {
      math = data['#cdata'];
      this.attribute = '#cdata';
    } else {
      math = data['#math'];
      this.attribute = '#math';
    }

    return (
      <span data-offset-key={this.props.offsetKey}>
        <MathRenderer inline>{math}</MathRenderer>
      </span>
    );
  }
}


export default function (props: Object) : Decorator {
  return {
    strategy: byType.bind(undefined, EntityTypes.math),
    component: Math,
    props,
  };
}
