import * as React from 'react';
import { handleInsertion } from './common';
import './markers.scss';

export const SectionEnd = (props) => {
  return (
    <span className="SectionSentinel" onClick={handleInsertion.bind(undefined, props)}>
      section end 
    </span>);
};
