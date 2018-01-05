import * as React from 'react';

import './ContentTitle.scss';

export type ContentTitleProps = {
  title: string;
  onDuplicate?: (e) => void;
  onRemove?: (e) => void;
};

export const ContentTitle: React.StatelessComponent<ContentTitleProps> = ({
  title, onDuplicate, onRemove,
}) => {
  return (
    <div className="content-title">
      <div className="title">{title}</div>
      <div className="flex-spacer"/>
      {onDuplicate
        ? (
          <div
            className="action-btn action-btn-duplicate"
            onClick={onDuplicate}>
            <i className="fa fa-copy" />
          </div>
        )
        : (null)
      }
      <div
        className="action-btn action-btn-remove"
        onClick={onRemove}>
        <i className="fa fa-trash-o" />
      </div>
    </div>
  );
};
