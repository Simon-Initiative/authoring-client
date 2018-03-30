import * as React from 'react';
import { AppServices } from 'editors/common/AppServices';
import { AppContext } from 'editors/common/AppContext';
import { ComponentProps } from 'types/component';
import { classNames } from 'styles/jss';
import ContiguousTextEditor from './ContiguousTextEditor';
import { ContiguousText } from 'data/content/learning/contiguous';

export interface ContiguousTextViewerProps {
  editorStyles?: any;
  model: ContiguousText;
  context: AppContext;
  services: AppServices;
}

/**
 * ContiguousTextViewer React Stateless Component
 */
export const ContiguousTextViewer:
  React.StatelessComponent<ComponentProps<ContiguousTextViewerProps>> = (({
  className, children, context, services, model, editorStyles,
}) => {
    return (
      <div className={classNames([className])}>
        <ContiguousTextEditor
          activeContentGuid={null}
          hover={null}
          onUpdateHover={() => {}}
          onFocus={() => {}}
          context={context}
          services={services}
          editMode={false}
          model={model}
          editorStyles={editorStyles}
          viewOnly
          onEdit={() => {}} />
      </div>
    );
  });
