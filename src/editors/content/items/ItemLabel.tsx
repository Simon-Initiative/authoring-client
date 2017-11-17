import * as React from 'react';

import './ItemLabel.scss';

export type ItemLabelProps = {
  editMode: boolean;
  label: string;
  onClick: () => void;
};

export const ItemLabel = (props: ItemLabelProps) => {
  return (
    <div className="item-label">
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
