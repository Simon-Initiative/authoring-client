import * as React from 'react';
import { StyledComponentProps } from 'types/component';
import { injectSheetSFC, classNames } from 'styles/jss';
import { AppServices } from 'editors/common/AppServices';
import { AppContext } from 'editors/common/AppContext';
import ContiguousTextEditor from 'editors/content/learning/contiguoustext/ContiguousTextEditor';
import { ContiguousText, ContiguousTextMode } from 'data/content/learning/contiguous';
import { Maybe } from 'tsmonad';
import { ParentContainer, TextSelection } from 'types/active';

import { styles } from 'editors/content/learning/contiguoustext/TitleTextEditor.styles';

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
    className, classes, context, services, model,
    editMode, onEdit, onFocus, editorStyles,
  }) => {
    return (
      <div className={classNames([
        'TitleTextEditor',
        classes.titleTextEditor,
        !editMode && classes.disabled,
        className])}>
          <ContiguousTextEditor
            onInsertParsedContent={() => { }}
            className={classes.contiguousTextEditor}
            activeContentGuid={null}
            hover={null}
            onUpdateHover={() => { }}
            onFocus={onFocus}
            context={context}
            services={services}
            editMode={editMode}
            model={(model as ContiguousText).with({ mode: ContiguousTextMode.SimpleText })}
            editorStyles={editorStyles}
            hideBorder={true}
            onEdit={onEdit} />
        <div className={classes.editIcon}>
          <i className="fa fa-pencil" />
        </div>
        <div className={classes.hoverUnderline} />
      </div>
    );
  }));
