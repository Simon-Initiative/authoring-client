import * as React from 'react';

import './RemovableContent.scss';

export type RemovableContentProps = {
  onRemove: () => void;
  editMode: boolean;
  associatedClasses: string;
  children?: any;
  title?: any;
};

export const RemovableContent = (props: RemovableContentProps) => {
  const classes = 'componentWrapper ' + props.associatedClasses;
  return (
    <div className={`removable-content ${classes}`}>
      {/*
      <span style={ { float: 'right' } }>
        <button
          disabled={!props.editMode}
          onClick={props.onRemove}
          type="button"
          className="btn btn-sm btn-outline-secondary">
          <i className="icon icon-remove"></i>
        </button>
      </span>
      */}
      <div className="content-title">
        {props.title}
        <div className="flex-spacer" />
        <button
          className="btn btn-sm remove-btn"
          disabled={!props.editMode}
          onClick={props.onRemove}>
          <i className="icon icon-remove"></i>
        </button>
      </div>
      <div className="content-body">
        {props.children}
      </div>
    </div>
  );
};
