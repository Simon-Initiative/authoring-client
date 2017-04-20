import * as React from 'react';
import * as contentTypes from '../../../../../data/contentTypes';
import { Decorator, byType } from './common';
import { EntityTypes } from '../../../../../data/content/html/common';

const InputRef = (props) => {
  const data = props.contentState.getEntity(props.entityKey).getData();
  
  if (data.$type === 'FillInTheBlank') {
    return (
        <select data-offset-key={props.offsetKey} disabled value='sample1' className="form-control-sm custom-select mb-2 mr-sm-2 mb-sm-0">
          <option value="sample1">Sample 1</option>
          <option value="sample2">Sample 2</option>
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