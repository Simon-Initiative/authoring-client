import * as React from 'react';

import './Remove.scss';

type RemoveProps = {
  className?: string;
  style?: any;
  editMode: boolean;
  loading?: boolean;
  customIcon?: string;
  children?: any;
  onRemove: (e) => void;
};

export const Remove: React.FunctionComponent<RemoveProps> = (props: RemoveProps) => {
  return (
    <span className={`remove-btn ${props.className || ''}`}>
      <button
        disabled={!props.editMode}
        tabIndex={-1}
        style={props.style}
        onClick={e => props.editMode && props.onRemove(e)}
        type="button"
        className="btn btn-sm">
        {props.children
          ? <span className="remove-button-content">{props.children}</span>
          : props.loading
            ? <i className="fas fa-circle-notch fa-spin fa-1x fa-fw" />
            : <i className={props.customIcon || 'fas fa-times'} />
        }
      </button>
    </span>
  );
};
