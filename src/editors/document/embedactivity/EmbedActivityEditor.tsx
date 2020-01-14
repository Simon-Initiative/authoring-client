import * as React from 'react';
import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';
import {
  AbstractEditor, AbstractEditorProps, AbstractEditorState,
} from 'editors/document/common/AbstractEditor';
import * as models from 'data/models';
import { ContextAwareToolbar } from 'components/toolbar/ContextAwareToolbar.controller';
import { ContextAwareSidebar } from 'components/sidebar/ContextAwareSidebar.controller';
import { ActiveContext, ParentContainer, TextSelection } from 'types/active';
import * as Messages from 'types/messages';
import { ContentElement } from 'data/content/common/interfaces';
import { Node } from 'data/content/assessment/node';
import { SidebarToggle } from 'editors/common/SidebarToggle.controller';
import { CourseState } from 'reducers/course';
import { ReplEditor } from 'editors/content/learning/repl/ReplEditor';
import './EmbedActivityEditor.scss';
import { ContiguousText, ContiguousTextMode } from 'data/content/learning/contiguous';
import guid from 'utils/guid';
import { TitleTextEditor } from 'editors/content/learning/contiguoustext/TitleTextEditor';
import * as contentTypes from 'data/contentTypes';
import { Editor } from 'slate-react';

interface Props extends AbstractEditorProps<models.EmbedActivityModel> {
  activeContext: ActiveContext;
  onUpdateContent: (documentId: string, content: ContentElement) => void;
  onUpdateContentSelection: (
    documentId: string, content: ContentElement, container: ParentContainer,
    textSelection: Maybe<TextSelection>) => void;
  hover: string;
  onUpdateHover: (hover: string) => void;
  showMessage: (message: Messages.Message) => void;
  dismissMessage: (message: Messages.Message) => void;
  course: CourseState;
  onSetCurrentNode: (documentId: string, node: Node) => void;
  onUpdateEditor: (editor) => void;
}

interface State extends AbstractEditorState {

}

export default class EmbedActivityEditor
  extends AbstractEditor<models.EmbedActivityModel, Props, State> {
  titleEditorGuid: string = guid();

  state: State = {
    ...this.state,
  };

  shouldComponentUpdate(nextProps: Props, nextState: State): boolean {
    return this.props.model !== nextProps.model
      || this.props.activeContext !== nextProps.activeContext
      || this.props.expanded !== nextProps.expanded
      || this.props.editMode !== nextProps.editMode
      || this.props.hover !== nextProps.hover
      || this.state.undoStackSize !== nextState.undoStackSize
      || this.state.redoStackSize !== nextState.redoStackSize;
  }

  supportedElements: Immutable.List<string> = Immutable.List<string>();

  onTitleEdit = (title: ContiguousText, src: ContentElement) => {
    const { model, onEdit } = this.props;

    onEdit(model.with({ title: title.extractPlainText().valueOr('') }));
  }

  onRemove() {
    // this method is never used, but is required by ParentContainer
    // do nothing
  }

  onPaste(childModel) {
    // this method is never used, but is required by ParentContainer
    // do nothing
  }

  onDuplicate(childModel) {
    // this method is never used, but is required by ParentContainer
    // do nothing
  }

  onMoveUp(childModel) {
    // this method is never used, but is required by ParentContainer
    // do nothing
  }

  onMoveDown(childModel) {
    // this method is never used, but is required by ParentContainer
    // do nothing
  }

  onAddNew(item) {
    // this method is never used, but is required by ParentContainer
    // do nothing
  }

  onEdit(item) {
    // this method is never used, but is required by ParentContainer
    // do nothing
  }

  onFocus = (
    model: any, parent: ParentContainer, textSelection: Maybe<TextSelection>) => {
    this.props.onUpdateContentSelection(
      this.props.context.documentId, model, this, textSelection);
  }

  onRichTextFocus = (
    model: contentTypes.RichText,
    editor: Editor,
    textSelection:  Maybe<TextSelection>,
  ) => {
    this.props.onUpdateEditor(editor);
    this.onFocus(model, null, textSelection);
    editor.focus();
  }

  unFocus = () => {
    this.props.onUpdateContentSelection(
      this.props.context.documentId, null, null, Maybe.nothing());
  }

  render() {
    const { context, services, editMode, model, course, onEdit, onUpdateEditor } = this.props;
    const activityType = course.embedActivityTypes.get(model.resource.id);
    return (
      <div className="embed-activity-editor">
        <ContextAwareToolbar editMode={editMode} context={context} model={model} />
        <div className="embed-activity-content">
          <div className="html-editor-well" onClick={() => this.unFocus()}>
            <SidebarToggle />

            <TitleTextEditor
              context={context}
              services={services}
              onFocus={() => this.unFocus()}
              model={ContiguousText.fromText(
                model.title, this.titleEditorGuid, ContiguousTextMode.SimpleText)}
              editMode={editMode}
              onEdit={this.onTitleEdit}
              editorStyles={{ fontSize: 32 }} />

            <div className="embed-activity-container">
              {activityType === 'REPL'
                ? (
                  <ReplEditor
                    {...this.props}
                    onShowSidebar={() => {}}
                    onDiscover={() => {}}
                    onFocus={() => {}}
                    onRichTextFocus={this.onRichTextFocus}
                    onUpdateEditor={onUpdateEditor}
                    activeContentGuid={''} />
                )
                : (
                  <div>Editing of Embed Activity type '{activityType}' is not supported</div>
                )
              }
            </div>
          </div>
          <ContextAwareSidebar
            context={context}
            services={services}
            editMode={editMode}
            model={model}
            onEditModel={onEdit} />
        </div>
      </div>
    );
  }
}
