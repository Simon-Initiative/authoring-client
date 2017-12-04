import * as React from 'react';

import './InputLabel.scss';

export type CheckboxProps = {
  editMode: boolean;
  label: string;
  value: boolean;
  onEdit: (value: boolean) => void;
};

export const Checkbox = (props: CheckboxProps) => {
  return (
    <label className="form-check-label btn">
      <input disabled={!props.editMode}
        onChange={e => props.onEdit(e.target.checked)}
        type="checkbox" checked={props.value} className="form-check-input"/>
      {props.label}
    </label>);
};
