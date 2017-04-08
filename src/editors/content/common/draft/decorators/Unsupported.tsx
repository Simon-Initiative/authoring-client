import * as React from 'react';
import { Decorator, byType } from './common';
import { EntityTypes } from '../custom';

import './Unsupported.scss';

const decorator : Decorator = {
  
  strategy: byType.bind(undefined, EntityTypes.unsupported),
  
  component: (props) => {
    const data = props.contentState.getEntity(props.entityKey).getData();
    return (
      <span className='UnsupportedEntity'>
        {props.children}
      </span>
    );
  }
};

export default decorator;