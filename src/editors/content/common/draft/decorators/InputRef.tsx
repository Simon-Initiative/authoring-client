import * as React from 'react';
import { byType, Decorator } from './common';
import { EntityTypes } from '../../../../../data/content/learning/common';

import './InputRef.scss';

const InputRef = (props) => {
  const data = props.contentState.getEntity(props.entityKey).getData();

  const selected = props.selectedEntity.caseOf({
    just: s => s === data['@input'] ? 'input-ref-selected' : '',
    nothing: () => '',
  });

  const onClick = (e) => {
    e.stopPropagation();
    props.onDecoratorClick(props.entityKey);
  };

  if (data.$type === 'FillInTheBlank') {
    return (
      <span
        onClick={onClick}
        className={`dropdownSpan ${selected}`}
        data-offset-key={props.offsetKey}>
        {props.children}
      </span>
    );
  }
  if (data.$type === 'Numeric') {
    return (
      <span
        onClick={onClick}
        className={`numericSpan ${selected}`}
        data-offset-key={props.offsetKey}>
        {props.children}
      </span>
    );

  }
  if (data.$type === 'Text') {
    return (
      <span
        onClick={onClick}
        className={`textSpan ${selected}`}
        data-offset-key={props.offsetKey}>
        {props.children}
      </span>
    );

  }

  return (
    <span
      onClick={onClick}
      className={`textSpan ${selected}`}
      data-offset-key={props.offsetKey}>
      {props.children}
    </span>
  );
};

export default function (props: Object): Decorator {
  return {
    strategy: byType.bind(undefined, EntityTypes.input_ref),
    component: InputRef,
    props,
  };
}
