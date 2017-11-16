import * as React from 'react';

export type RemovableContentProps = {
  onRemove: () => void;
  editMode: boolean;
  associatedClasses: string;
  children?: any;
};

export const RemovableContent = (props: RemovableContentProps) => {
  const classes = 'componentWrapper ' + props.associatedClasses;
  return (
    <div className={classes}>
      <span style={ { float: 'right' } }>
        <button
          disabled={!props.editMode}
          onClick={props.onRemove}
          type="button"
          className="btn btn-sm btn-outline-secondary">
          <i className="icon icon-remove"></i>
        </button>
      </span>

      {props.children}

    </div>
  );
};
