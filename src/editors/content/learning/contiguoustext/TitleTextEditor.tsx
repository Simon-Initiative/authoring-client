import * as React from 'react';
import { withStyles, classNames } from 'styles/jss';
import { AppServices } from 'editors/common/AppServices';
import { AppContext } from 'editors/common/AppContext';
import ContiguousTextEditor from 'editors/content/learning/contiguoustext/ContiguousTextEditor';
import { ContiguousText, ContiguousTextMode } from 'data/content/learning/contiguous';
import { Maybe } from 'tsmonad';
import { ParentContainer, TextSelection } from 'types/active';
import { styles } from 'editors/content/learning/contiguoustext/TitleTextEditor.styles';
import { connectTextEditor } from 'editors/content/container/connectEditor';

export interface TitleTextEditorProps {
  editorStyles?: any;
  model: ContiguousText;
  context: AppContext;
  services: AppServices;
  editMode: boolean;
  onUpdateEditor: (editor) => void;
  onEdit: (updated: ContiguousText, source?: Object) => void;
  onFocus: (
    model: any, parent: ParentContainer,
    textSelection: Maybe<TextSelection>) => void;
}

/**
 * TitleTextEditor React Stateless Component
 */
const TitleTextEditorInner
  = withStyles<TitleTextEditorProps>(styles)(({
    className, classes, context, services, model,
    editMode, onEdit, onFocus, editorStyles, onUpdateEditor,
  }) => {
    return (
      <div className={classNames([
        'TitleTextEditor',
        classes.titleTextEditor,
        !editMode && classes.disabled,
        className])}>
        <ContiguousTextEditor
          onUpdateEditor={onUpdateEditor}
          onInsertParsedContent={() => { }}
          onSelectInline={() => { }}
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
          orderedIds={null}
          hideBorder={true}
          onEdit={onEdit} />
        <div className={classes.editIcon}>
          <i className="fas fa-pencil-alt" />
        </div>
        <div className={classes.hoverUnderline} />
      </div>
    );
  });

export const TitleTextEditor = connectTextEditor(TitleTextEditorInner);

