import * as React from 'react';

export type ItemLabelProps = {
  label: string;
  onClick: () => void;
}

export const ItemLabel = (props: ItemLabelProps) => {
  return (
    <div style={{float: 'right'}}>
      <span>
        {props.label}
      </span>
      <button onClick={props.onClick} type="button" className="btn btn-sm btn-outline-secondary">
        <i className='icon icon-remove'></i>
      </button>
    </div>
  )
}; 