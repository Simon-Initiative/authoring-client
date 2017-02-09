import * as React from 'react';

export const Video = (props) => {
  return <video controls src={props.src} style={{width: '100%'}} />;
};