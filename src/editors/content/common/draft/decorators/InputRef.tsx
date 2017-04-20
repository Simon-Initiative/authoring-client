import * as React from 'react';
import * as contentTypes from '../../../../../data/contentTypes';
import { Decorator, byType } from './common';
import { EntityTypes } from '../../../../../data/content/html/common';

import './InputRef.scss';

const InputRef = (props) => {
  const data = props.contentState.getEntity(props.entityKey).getData();
  
  if (data.$type === 'FillInTheBlank') {
    
    let selected = props.activeItemId === data['@input'] ? 'InputRefSelected' : '';
    let classes = 'form-control-sm custom-select mb-2 mr-sm-2 mb-sm-0 ' + selected;
    
    return (
        <select data-offset-key={props.offsetKey} disabled 
          value='sample1' className={classes}>
          <option value="sample1">Fill in the blank</option>
        </select>
      );
  } else {
    return <span>Unsupported</span>;
  }

};



export default function(props: Object) : Decorator {
  return {
    strategy: byType.bind(undefined, EntityTypes.input_ref),
    component: InputRef,
    props
  };
};