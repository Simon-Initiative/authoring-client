import * as React from 'react';
import { StyledComponentProps } from 'types/component';
import { injectSheetSFC, classNames } from 'styles/jss';
import { AppServices } from 'editors/common/AppServices';
import { AppContext } from 'editors/common/AppContext';
import ContiguousTextEditor from './ContiguousTextEditor';
import { ContiguousText } from 'data/content/learning/contiguous';
import { Maybe } from 'tsmonad';
import { ParentContainer, TextSelection } from 'types/active';

import { styles } from './TitleTextEditor.styles';

export interface TitleTextEditorProps {
  editorStyles?: any;
  model: ContiguousText;
  context: AppContext;
  services: AppServices;
  editMode: boolean;
  onEdit: (updated: ContiguousText, source?: Object) => void;
  onFocus: (
    model: any, parent: ParentContainer,
    textSelection: Maybe<TextSelection>) => void;
}

/**
 * TitleTextEditor React Stateless Component
 */
export const TitleTextEditor
  = injectSheetSFC<StyledComponentProps<TitleTextEditorProps>>(styles)((({
  className, classes, children, context, services, model,
  editMode, onEdit, onFocus, editorStyles,
}) => {
    return (
      <div className={classNames(['TitleTextEditor', classes.titleTextEditor, className])}>
        <ContiguousTextEditor
          onInsertParsedContent={() => {}}
          className={classes.contiguousTextEditor}
          activeContentGuid={null}
          hover={null}
          onUpdateHover={() => {}}
          onFocus={onFocus}
          context={context}
          services={services}
          editMode={editMode}
          model={model}
          editorStyles={editorStyles}
          hideBorder={true}
          onEdit={onEdit} />
      </div>
    );
  }));
