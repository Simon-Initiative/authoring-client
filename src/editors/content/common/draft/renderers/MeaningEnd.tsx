import * as React from 'react';
import { handleInsertion } from './common';
import './markers.scss';

export const MeaningEnd = (props) => {
  return (
    <span className="MeaningSentinel" onClick={handleInsertion.bind(undefined, props)}>
      meaning end
    </span>);
};
