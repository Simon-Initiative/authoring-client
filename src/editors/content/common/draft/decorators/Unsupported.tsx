import * as React from 'react';
import { byType, Decorator } from './common';
import { EntityTypes } from '../../../../../data/content/learning/common';

import './Unsupported.scss';


export default function (props: Object) : Decorator {
  return {

    strategy: byType.bind(undefined, EntityTypes.unsupported),

    component: (props) => {
      return (
        <span className="UnsupportedEntity">
          {props.children}
        </span>
      );
    },

    props,
  };
}
