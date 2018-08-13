import * as React from 'react';

import './ToggleSwitch.scss';

export interface ToggleSwitchProps {
  editMode?: boolean;
  className?: string;
  style?: any;
  checked?: boolean;
  onClick: (e) => void;
  label: string | JSX.Element;
  labelBefore?: string | JSX.Element;
}

/**
 * React Stateless ToggleSwitch
 */
export const ToggleSwitch: React.StatelessComponent<ToggleSwitchProps> = ({
  className, style, checked, onClick, label, editMode, labelBefore,
}) => {
  const disabled = (editMode !== undefined && !editMode);

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
      {label && <span className="label after">{label}</span>}
    </div>
  );
};
