import * as React from 'react';
import { handleInsertion } from './common';
import './markers.scss';

export const PronunciationEnd = (props) => {
  return (
    <span className="PronunciationSentinel" onClick={handleInsertion.bind(undefined, props)}>
      pronunciation end
    </span>);
};
