import * as React from 'react';
import { handleInsertion } from './common';
import './markers.scss';

export const ExampleEnd = (props) => {
  return (
    <span className='ExampleSentinel' onClick={handleInsertion.bind(undefined, props)}>
      example end
    </span>);
};