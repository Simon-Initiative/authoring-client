import * as React from 'react';
import { AppServices } from 'editors/common/AppServices';
import { AppContext } from 'editors/common/AppContext';
import { Html } from 'data/content/html.ts';
import { HtmlContentEditor } from '../html/HtmlContentEditor';
import InlineInsertionToolbar from '../html/InlineInsertionToolbar';
import InlineToolbar from '../html/InlineToolbar';
import BlockToolbar from '../html/BlockToolbar';
import { Remove } from 'components/common/Remove';
import { Maybe } from 'tsmonad';

import './InputList.scss';

const HTML_CONTENT_EDITOR_STYLE = {
  minHeight: '20px',
  borderStyle: 'none',
  borderWith: 1,
  borderColor: '#AAAAAA',
};

export interface InputListProps {
  className?: string;
}

export const InputList: React.StatelessComponent<InputListProps> = ({
  className,
  children,
}) => {
  // verify children are valid
  React.Children.forEach(children, (child: React.ReactElement<any>) => {
    if (child.type !== InputListItem) {
      throw new Error('InputList children must consist of elements only of type InputListItem');
    }
  });

  return (
    <div className={`input-list ${className || ''}`}>
      {children}
    </div>
  );
};

export interface InputListItemProps {
  className?: string;
  id: string;
  label: string;
  contentTitle?: string;
  context: AppContext;
  services: AppServices;
  body: Html;
  editMode: boolean;
  onEdit: (body: Html) => void;
  onRemove?: (id: string) => void;
}

export const InputListItem: React.StatelessComponent<InputListItemProps> = ({
  className,
  children,
  id,
  label,
  contentTitle,
  context,
  services,
  body,
  editMode,
  onEdit,
  onRemove,
}) => {
  const elementChildren = React.Children.toArray(children)
    .map((element: React.ReactElement<any>): React.ReactElement<any> =>
       React.cloneElement(element, { editMode }),
    );

  const itemOptionRows = elementChildren.filter(
    (child: React.ReactElement<any>): boolean => child.type === ItemOptions,
  );

  const itemControls = elementChildren.filter(
    (child: React.ReactElement<any>): boolean => child.type === ItemControl,
  );

  return (
    <div className={`input-list-item ${className || ''}`}>
      <div className="input-list-item-label">
        {label}
        {itemControls}
      </div>
      <div className="input-list-item-content">
        {contentTitle
          ? (<div className="input-list-item-content-title">{contentTitle}</div>)
          : (null)
        }
        <HtmlContentEditor
          editorStyles={HTML_CONTENT_EDITOR_STYLE}
          inlineToolbar={<InlineToolbar/>}
          blockToolbar={<BlockToolbar/>}
          inlineInsertionToolbar={<InlineInsertionToolbar/>}
          context={context}
          services={services}
          editMode={editMode}
          model={body}
          onEdit={onEdit} />
        {itemOptionRows}
      </div>
      {onRemove
        ? (
          <Remove
            className={contentTitle ? 'content-title-btn-offset' : ''}
            editMode={editMode}
            onRemove={() => onRemove(id)} />
        )
        : (
          <span className="remove-btn"></span>
        )
      }
    </div>
  );
};

export interface ItemControlProps {
  className?: string;
}

export const ItemControl: React.StatelessComponent<ItemControlProps> = ({
  className,
  children,
}) => {
  return (
    <div className={`input-list-item-control ${className || ''}`}>
      {children}
    </div>
  );
};

export interface ItemOptionsProps {
  className?: string;
}

export const ItemOptions: React.StatelessComponent<ItemOptionsProps> = ({
  className,
  children,
}) => {
  return (
    <div className={`input-list-item-options ${className || ''}`}>
      {children}
    </div>
  );
};

export interface ItemOptionProps {
  className?: string;
  label: string;
  flex?: boolean;
}

export const ItemOption: React.StatelessComponent<ItemOptionProps> = ({
  className,
  children,
  label,
  flex,
}) => {
  return (
    <div className={`input-list-item-option ${className || ''} ${flex ? 'flex-spacer' : ''}`}>
        <div className="option-label">
          {label}
        </div>
        <div className="option-content">
          {children}
        </div>
    </div>
  );
};

export const ItemOptionFlex: React.StatelessComponent<{}> = () => {
  return (
    <div className="flex-spacer" />
  );
};
