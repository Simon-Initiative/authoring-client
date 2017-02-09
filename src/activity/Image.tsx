import * as React from 'react';

export const Image = (props) => {
  return <div><img src={props.src} style={{width: '100%'}} /></div>;
};