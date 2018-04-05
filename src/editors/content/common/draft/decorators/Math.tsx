import * as React from 'react';
import { byType, Decorator } from './common';
import { EntityTypes } from '../../../../../data/content/learning/common';
import { Math as MathRenderer  } from '../../../../../utils/math/Math';
import { ContentState } from 'draft-js';
import { Math as MathData } from 'data/content/learning/math';
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
  onDecoratorClick: (offsetKey) => void;
}

class Math extends React.Component<MathProps, any> {

  constructor(props) {
    super(props);
  }

  render() : JSX.Element {
    const data : MathData
      = this.props.contentState.getEntity(this.props.entityKey).getData();

    return (
      <span data-offset-key={this.props.offsetKey}
        onClick={(e) => {
          e.stopPropagation();
          this.props.onDecoratorClick(this.props.entityKey);
        }}>
        <MathRenderer inline>{data.data}</MathRenderer>
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
