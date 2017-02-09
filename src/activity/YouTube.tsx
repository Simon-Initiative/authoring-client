import * as React from 'react';

export const YouTube = (props) => {
  return <iframe src={props.src} style={{width: '100%', border: '0px'}}></iframe>
};