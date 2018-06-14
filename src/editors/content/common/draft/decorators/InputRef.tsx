import * as React from 'react';
import { byType, Decorator } from './common';
import { EntityTypes } from '../../../../../data/content/learning/common';

import './InputRef.scss';

const InputRef = (props) => {
  const data = props.contentState.getEntity(props.entityKey).getData();

  // const selected = props.activeItemId === data['@input'] ? 'InputRefSelected' : '';

  if (data.$type === 'FillInTheBlank') {
    return (
      <span className="dropdownSpan" data-offset-key={props.offsetKey}>
        &emsp;&emsp;&emsp;&emsp;&emsp;</span>
    );
  }
  if (data.$type === 'Numeric') {
    return (
      <span className="numericSpan" data-offset-key={props.offsetKey}>
      &emsp;&emsp;&emsp;&emsp;&emsp;</span>
    );

  }
  if (data.$type === 'Text') {
    return (
      <span className="textSpan" data-offset-key={props.offsetKey}>
      &emsp;&emsp;&emsp;&emsp;&emsp;</span>
    );

  }

  return (
    <span className="textSpan" data-offset-key={props.offsetKey}>
    &emsp;&emsp;&emsp;&emsp;&emsp;</span>
  );
};

export default function (props: Object) : Decorator {
  return {
    strategy: byType.bind(undefined, EntityTypes.input_ref),
    component: InputRef,
    props,
  };
}
