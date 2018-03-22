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
  const disabled = (editMode === false);

  return (
    <div
      className={`toggle-switch ${className || ''} ${disabled && 'disabled'}`}
      style={style} onClick={e => !disabled && onClick(e)}>
      {labelBefore && <span className="label before">{labelBefore}</span>}
      <input
        className="toggle toggle-light"
        type="checkbox"
        readOnly
        disabled={disabled}
        checked={checked || false} />
      <label className="toggle-btn"></label>
      {labelAfter && <span className="label after">{labelAfter}</span>}
    </div>
  );
};
