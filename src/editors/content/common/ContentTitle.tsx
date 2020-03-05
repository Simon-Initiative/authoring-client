import * as React from 'react';
import { Tooltip } from 'utils/tooltip';

import './ContentTitle.scss';

const DEFAULT_REMOVE_DISABLED_MSG = 'Content cannot be removed';

export type RemoveButtonProps = {
  canRemove: boolean;
  removeDisabledMessage: string;
  onClick: (...args) => void;
};

export const RemoveButton =
  ({ canRemove, removeDisabledMessage, onClick }: RemoveButtonProps) => {
    const btn =
      <div
        className={`action-btn action-btn-remove ${canRemove ? '' : 'disabled'}`}
        onClick={canRemove ? onClick : () => { }}>
        <i className="fas fa-trash" />
        Delete
    </div>;

    return !canRemove && removeDisabledMessage
      ? <Tooltip title={removeDisabledMessage}>{btn}</Tooltip>
      : btn;
  };

export type ContentTitleProps = {
  title: string;
  canRemove: boolean;
  editMode: boolean;
  removeDisabledMessage?: string;
  onDuplicate?: (e) => void;
  onCopy?: (e) => void;
  onPaste?: (e) => void;
  onRemove?: (e) => void;
  helpPopover?: JSX.Element;
};

export const ContentTitle: React.StatelessComponent<ContentTitleProps> = ({
  title, editMode, canRemove, removeDisabledMessage,
  onDuplicate, onCopy, onPaste,
  onRemove, helpPopover,
}) => (
    <div className="content-title">
      <div className="title">{title} {helpPopover}</div>

      <span>&nbsp;&nbsp;&nbsp;&nbsp;</span>

      {onDuplicate
        ? <div
          className={'action-btn action-btn-duplicate'}
          onClick={onDuplicate}>
          <i className="fa fa-clone" />
          Duplicate
      </div>
        : null}

      <span>&nbsp;</span>
      {onCopy
        ? <div
            className={'action-btn action-btn-duplicate'}
            onClick={onCopy}>
            <i className="fa fa-clipboard" />
            Copy
        </div>
          : null}

      <span>&nbsp;</span>
      {onPaste
        ? <div
            className={'action-btn action-btn-duplicate'}
            onClick={onPaste}>
            <i className="fa fa-paste" />
            Paste
        </div>
          : null}

      <span>&nbsp;</span>

      <RemoveButton
        canRemove={editMode && canRemove} onClick={onRemove}
        removeDisabledMessage={editMode
          && (removeDisabledMessage || DEFAULT_REMOVE_DISABLED_MSG)} />
    </div>
  );
