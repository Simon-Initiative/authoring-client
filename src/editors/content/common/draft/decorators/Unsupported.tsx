import * as React from 'react';
import { Decorator, byType } from './common';
import { EntityTypes } from '../custom';

import './Unsupported.scss';


export default function(props: Object) : Decorator {
  return {

    strategy: byType.bind(undefined, EntityTypes.unsupported),

    component: (props) => {
      const data = props.contentState.getEntity(props.entityKey).getData();
      return (
        <span className='UnsupportedEntity'>
          {props.children}
        </span>
      )
    },

    props
  }
};
