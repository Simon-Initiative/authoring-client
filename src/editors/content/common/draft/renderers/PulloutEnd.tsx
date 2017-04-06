import * as React from 'react';

import './markers.scss';

export const PulloutEnd = (props) => {
  return (
    <span className='Marker'>
      pullout end ({props.subType}) 
    </span>);
};