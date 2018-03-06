import * as React from 'react';


export type LabelProps = {
  children: any;
};

export const Label = (props: LabelProps) => {
  return (
    <div className="sidebar-label">
      {props.children}
    </div>
  );
};

export const VerticalSpacer = () => <div className="sidebar-spacer"/>;
