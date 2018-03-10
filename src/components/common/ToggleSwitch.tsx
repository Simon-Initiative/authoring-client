import * as React from 'react';

import './ToggleSwitch.scss';

export interface ToggleSwitchProps {
  editMode?: boolean;
  className?: string;
  style?: any;
  checked?: boolean;
  onClick?: (e) => void;
  labelBefore?: string;
  labelAfter?: string;
}

/**
 * React Stateless ToggleSwitch
 */
export const ToggleSwitch: React.StatelessComponent<ToggleSwitchProps> = ({
  className, style, checked, onClick, labelBefore, labelAfter, editMode,
}) => {
  return (
    <div className={`toggle-switch ${className || ''}`} style={style} onClick={onClick}>
      {labelBefore && <span className="label before">{labelBefore}</span>}
      <input
        className="toggle toggle-light"
        type="checkbox"
        readOnly
        checked={checked || false} />
      <label className="toggle-btn"></label>
      {labelAfter && <span className="label after">{labelAfter}</span>}
    </div>
  );
};
