import * as React from 'react';
import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';
import { AbstractEditor, AbstractEditorProps, AbstractEditorState } from '../common/AbstractEditor';
import { Resource } from 'data/content/resource';
import { ContentContainer } from 'editors/content/container/ContentContainer';
import * as models from 'data/models';
import * as contentTypes from 'data/contentTypes';
import { ContextAwareToolbar } from 'components/toolbar/ContextAwareToolbar.controller';
import { ContextAwareSidebar } from 'components/sidebar/ContextAwareSidebar.controller';
import { ActiveContext, ParentContainer, TextSelection } from 'types/active';
import { ContentElements } from 'data/content/common/elements';

import './WorkbookPageEditor.scss';

export interface WorkbookPageEditorProps extends AbstractEditorProps<models.WorkbookPageModel> {
  fetchObjectives: (courseId: string) => void;
  preview: (courseId: string, resource: Resource) => Promise<any>;
  activeContext: ActiveContext;
  onUpdateContent: (documentId: string, content: Object) => void;
  onUpdateContentSelection: (
    documentId: string, content: Object, container: ParentContainer,
    textSelection: Maybe<TextSelection>) => void;
}

interface WorkbookPageEditorState extends AbstractEditorState {}

function hasMissingResource() : boolean {
  // TODO restore post wb fix
  return false;
}


class WorkbookPageEditor extends AbstractEditor<models.WorkbookPageModel,
  WorkbookPageEditorProps, WorkbookPageEditorState> {
  constructor(props: WorkbookPageEditorProps) {
    super(props, {});

    this.onModelEdit = this.onModelEdit.bind(this);

    if (this.hasMissingObjective(
      props.model.head.objrefs, props.context.objectives)) {
      props.services.refreshObjectives(props.context.courseId);
    }
    if (hasMissingResource()) {
      props.services.refreshCourse(props.context.courseId);
    }
  }

  shouldComponentUpdate(nextProps: WorkbookPageEditorProps) : boolean {
    if (this.props.activeContext !== nextProps.activeContext) {
      return true;
    }
    if (this.props.model !== nextProps.model) {
      return true;
    }
    if (this.props.editMode !== nextProps.editMode) {
      return true;
    }
    if (this.props.context !== nextProps.context) {
      return true;
    }

    return false;
  }

  onModelEdit(model) {
    this.handleEdit(model);
  }

  onBodyEdit(content : any, source: Object) {

    const model = this.props.model.with({ body: content });

    const onlySelectionChange = (source instanceof contentTypes.ContiguousText
      && this.props.activeContext.activeChild
      .caseOf({
        just: n => (n as any).guid === source.guid
          ? (n as contentTypes.ContiguousText).content === source.content : false,
        nothing: () => false }));

    this.props.onUpdateContent(this.props.context.documentId, source);

    if (!onlySelectionChange) {
      this.handleEdit(model);
    }

  }

  onTitleEdit(text: ContentElements) {

    const t = text.extractPlainText().caseOf({ just: s => s, nothing: () => '' });

    const resource = this.props.model.resource.with({ title: t });
    const title = this.props.model.head.title.with({ text });
    const head = this.props.model.head.with({ title });

    this.props.onEdit(this.props.model.with({ head, resource }));
  }

  hasMissingObjective(
    objrefs: Immutable.List<string>,
    objectives: Immutable.OrderedMap<string, contentTypes.LearningObjective>) {

    return objrefs
      .toArray()
      .some(id => !objectives.has(id));
  }

  componentWillReceiveProps(nextProps: WorkbookPageEditorProps) {

    if (nextProps.model !== this.props.model) {
      if (this.hasMissingObjective(
        nextProps.model.head.objrefs, nextProps.context.objectives)) {

        nextProps.services.refreshObjectives(nextProps.context.courseId);
      }
    }
  }

  onFocus(model, parent, textSelection) {
    this.props.onUpdateContentSelection(
      this.props.context.documentId, model, parent, textSelection);
  }

  render() {
    const text = this.props.model.head.title.text.extractPlainText().caseOf({
      just: s => s,
      nothing: () => '',
    });

    const activeGuid = this.props.activeContext.activeChild.caseOf({
      just: c => (c as any).guid,
      nothing: () => '',
    });

    return (
      <div className="workbookpage-editor">
        <h2 className="title-row">{text}</h2>
        <ContextAwareToolbar
          context={this.props.context}
        />
        <div className="wb-content">
          <div className="html-editor-well">
            <ContentContainer
              parent={null}
              activeContentGuid={activeGuid}
              onFocus={this.onFocus.bind(this)}
              editMode={this.props.editMode}
              services={this.props.services}
              context={this.props.context}
              model={this.props.model.body}
              onEdit={(c, s) => this.onBodyEdit(c, s)} />
          </div>
          <ContextAwareSidebar />
        </div>
      </div>
    );
  }

}

export default WorkbookPageEditor;
