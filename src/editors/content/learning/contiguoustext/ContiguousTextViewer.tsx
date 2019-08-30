import * as React from 'react';
import { AppServices } from 'editors/common/AppServices';
import { AppContext } from 'editors/common/AppContext';
import { ComponentProps } from 'types/component';
import { classNames } from 'styles/jss';
import ContiguousTextEditor from './ContiguousTextEditor';
import { ContiguousText } from 'data/content/learning/contiguous';
import { connectTextEditor } from 'editors/content/container/connectEditor';

export interface ContiguousTextViewerProps {
  editorStyles?: any;
  model: ContiguousText;
  context: AppContext;
  services: AppServices;
  onUpdateEditor: (editor) => void;
}

/**
 * ContiguousTextViewer React Stateless Component
 */
const ContiguousTextViewerInner:
  React.StatelessComponent<ComponentProps<ContiguousTextViewerProps>> = (({
    className, context, services, model, editorStyles, onUpdateEditor,
  }) => {
    return (
      <div className={classNames([className])}>
        <ContiguousTextEditor
          onUpdateEditor={onUpdateEditor}
          onInsertParsedContent={() => { }}
          activeContentGuid={null}
          hover={null}
          onUpdateHover={() => { }}
          onFocus={() => { }}
          context={context}
          orderedIds={null}
          services={services}
          editMode={false}
          model={model}
          editorStyles={editorStyles}
          viewOnly
          onEdit={() => { }} />
      </div>
    );
  });

export const ContiguousTextViewer = connectTextEditor(ContiguousTextViewerInner);
