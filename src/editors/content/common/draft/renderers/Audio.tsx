import * as React from 'react';

export const Audio = (props) => {
  return <audio controls src={props.data.src} style={{width: '100%'}} />;
};