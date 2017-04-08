import * as React from 'react';

import './markers.scss';

export const PulloutEnd = (props) => {
  return (
    <span className='PulloutSentinel'>
      pullout end ({props.subType}) 
    </span>);
};