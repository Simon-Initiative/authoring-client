import * as React from 'react';
import { Tooltip } from 'utils/tooltip';

import './ContentTitle.scss';

const DEFAULT_REMOVE_DISABLED_MSG = 'Content cannot be removed';

export type RemoveButtonProps = {
  editMode: boolean;
  removeDisabledMessage: string;
  onClick: (...args) => void;
};

export const RemoveButton = ({ editMode, removeDisabledMessage, onClick }: RemoveButtonProps) => {
  const btn =
    <div
      className={`action-btn action-btn-remove ${editMode ? '' : 'disabled'}`}
      onClick={editMode ? onClick : () => {}}>
      <i className="fa fa-trash-o" />
    </div>;

  return editMode ? btn : <Tooltip title={removeDisabledMessage}>{btn}</Tooltip>;
};

export type ContentTitleProps = {
  title: string;
  canRemove: boolean;
  removeDisabledMessage?: string;
  onDuplicate?: (e) => void;
  onRemove?: (e) => void;
};

export const ContentTitle: React.StatelessComponent<ContentTitleProps> = ({
  title, canRemove, removeDisabledMessage, onDuplicate, onRemove,
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
      <RemoveButton
        editMode={canRemove} onClick={onRemove}
        removeDisabledMessage={removeDisabledMessage || DEFAULT_REMOVE_DISABLED_MSG}/>
    </div>
  );
};
