import * as React from 'react';

import './ToggleSwitch.scss';

export interface ToggleSwitchProps {
  className?: string;
  checked?: boolean;
  onClick?: (e) => void;
}

/**
 * React Stateless ToggleSwitch
 */
export const ToggleSwitch: React.StatelessComponent<ToggleSwitchProps> = ({
  className, checked, onClick,
}) => {
  return (
    <div className={`toggle-switch ${className || ''}`} onClick={onClick}>
      <input
        className="toggle toggle-light"
        type="checkbox"
        readOnly
        checked={checked || false} />
      <label className="toggle-btn"></label>
    </div>
  );
};
