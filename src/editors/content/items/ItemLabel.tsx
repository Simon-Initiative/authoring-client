import * as React from 'react';

export type ItemLabelProps = {
  editMode: boolean;
  label: string;
  onClick: () => void;
};

export const ItemLabel = (props: ItemLabelProps) => {
  return (
    <div className="itemType">
      <span>
        {props.label}
      </span>
      <button disabled={!props.editMode} onClick={props.onClick}
        type="button" className="btn btn-sm btn-outline-secondary">
        <i className="icon icon-remove"></i>
      </button>
    </div>
  );
};
