import * as React from 'react';

import './Well.scss';

export type WellProps = {
  children?: any;
};

export const Well = (props: WellProps) => {
  return (
    <div className="Well">
      {props.children}
    </div>
  );
}; 
