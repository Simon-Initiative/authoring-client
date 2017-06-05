import * as React from 'react';
import { Decorator, byType } from './common';
import { EntityTypes } from '../../../../../data/content/html/common';
import ModalMediaEditor from '../../../media/ModalMediaEditor';

class Image extends React.PureComponent<any, any> {

  a: any;

  constructor(props) {
    super(props);
  }

  render() : JSX.Element {
    const data = this.props.contentState.getEntity(this.props.entityKey).getData();
    
    return (
      <img src={data.image.src}
        data-offset-key={this.props.offsetKey}/>
    );
  }
}

export default function (props: Object) : Decorator {
  return {
    strategy: byType.bind(undefined, EntityTypes.image),
    component: Image,
    props,
  };
}
