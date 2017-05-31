import * as React from 'react';
import { handleInsertion } from './common';
import './markers.scss';

export const PulloutEnd = (props) => {
  return (
    <span className="PulloutSentinel" onClick={handleInsertion.bind(undefined, props)}>
      pullout end
    </span>);
};
