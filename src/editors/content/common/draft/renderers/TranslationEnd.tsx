import * as React from 'react';
import { handleInsertion } from './common';
import './markers.scss';

export const TranslationEnd = (props) => {
  return (
    <span className="TranslationSentinel" onClick={handleInsertion.bind(undefined, props)}>
      translation end
    </span>);
};
