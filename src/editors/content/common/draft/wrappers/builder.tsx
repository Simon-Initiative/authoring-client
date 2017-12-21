import * as React from 'react';

export function buildDivWrapper(className: string) : any {
  return (props) => {
    return (
      <div className={className}>
        {props.children}
      </div>);
  };
}
