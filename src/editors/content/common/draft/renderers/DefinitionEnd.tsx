import * as React from 'react';
import { handleInsertion } from './common';
import './markers.scss';

export const DefinitionEnd = (props) => {
  return (
    <span className="DefinitionSentinel" onClick={handleInsertion.bind(undefined, props)}>
      definition end
    </span>);
};
