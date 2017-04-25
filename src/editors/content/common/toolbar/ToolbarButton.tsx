import * as React from 'react';

import { ToolbarActionProvider } from './Toolbar';

export type ToolbarButtonProps = {
  action: (controller: ToolbarActionProvider) => void,
  icon: string,
  provider?: ToolbarActionProvider
}

export const ToolbarButton = (props) => {
  const { action, icon, provider } = props;
  const iconClasses = 'icon icon-' + icon;
  const style = {
    color: 'white'
  }
  const buttonStyle = {
    backgroundColor: 'black'
  }
  return (
    <button onClick={() => action(provider)} type="button" className="btn" style={buttonStyle}>
      <i style={style} className={iconClasses}></i>
    </button>
  );
}
