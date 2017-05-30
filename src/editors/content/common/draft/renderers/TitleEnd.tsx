import * as React from 'react';
import { handleInsertion } from './common';
import './markers.scss';

export const TitleEnd = (props) => {
  return (
    <span className="TitleSentinel" onClick={handleInsertion.bind(undefined, props)}>
      title end
    </span>);
};
