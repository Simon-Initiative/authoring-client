import * as React from 'react';

import './markers.scss';

export const PulloutBegin = (props) => {
  return (
    <span className='Marker'>
      pullout begin ({props.subType}) 
    </span>);
};