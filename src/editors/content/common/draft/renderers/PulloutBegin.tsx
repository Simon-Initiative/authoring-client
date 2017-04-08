import * as React from 'react';

import './markers.scss';

export const PulloutBegin = (props) => {
  return (
    <span className='PulloutSentinel'>
      pullout begin ({props.subType}) 
    </span>);
};