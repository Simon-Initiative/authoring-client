import * as React from 'react';
import * as Immutable from 'immutable';

import { AbstractEditor, AbstractEditorProps, AbstractEditorState } from '../common/AbstractEditor';
import { UndoRedoToolbar } from '../common/UndoRedoToolbar';
import { Resource } from 'data/content/resource';
import { ContentContainer } from 'editors/content/container/ContentContainer';
import * as models from 'data/models';
import * as contentTypes from 'data/contentTypes';
import { ContentState } from 'draft-js';
import { getEntities } from 'data/content/learning/changes';
import { EntityTypes } from 'data/content/learning/common';
import { Objectives } from './Objectives';
import { TabContainer } from '../../content/common/TabContainer';
import { Details } from './Details';
import { Actions } from './Actions';
import { ContextAwareToolbar } from 'components/toolbar/ContextAwareToolbar.controller';
import { ActiveContext, ParentContainer } from 'types/active';
import { TitleContentEditor } from '../../content/title/TitleContentEditor';
import { ContentElements } from 'data/content/common/elements';

import './WorkbookPageEditor.scss';

export interface WorkbookPageEditorProps extends AbstractEditorProps<models.WorkbookPageModel> {
  fetchObjectives: (courseId: string) => void;
  preview: (courseId: string, resource: Resource) => Promise<any>;
  activeContext: ActiveContext;
  onUpdateContent: (documentId: string, content: Object) => void;
  onUpdateContentSelection: (
    documentId: string, content: Object, container: ParentContainer) => void;
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
    this.onObjectivesEdit = this.onObjectivesEdit.bind(this);

    if (this.hasMissingObjective(
      props.model.head.objrefs, props.context.objectives)) {
      props.services.refreshObjectives(props.context.courseId);
    }
    if (hasMissingResource()) {
      props.services.refreshCourse(props.context.courseId);
    }
  }

  shouldComponentUpdate(nextProps: WorkbookPageEditorProps) : boolean {
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

  onBodyEdit(content : any) {
    const model = this.props.model.with({ body: content });
    this.handleEdit(model);
  }

  onTitleEdit(text: ContentElements) {

    const t = text.extractPlainText().caseOf({ just: s => s, nothing: () => '' });

    const resource = this.props.model.resource.with({ title: t });
    const title = this.props.model.head.title.with({ text });
    const head = this.props.model.head.with({ title });

    this.props.onEdit(this.props.model.with({ head, resource }));
  }

  onObjectivesEdit(objrefs: Immutable.List<string>) {

    const head = this.props.model.head.with({ objrefs });
    this.handleEdit(this.props.model.with({ head }));
  }

  hasMissingObjective(
    objrefs: Immutable.List<string>,
    objectives: Immutable.OrderedMap<string, contentTypes.LearningObjective>) {

    return objrefs
      .toArray()
      .some(id => !objectives.has(id));
  }

  renderObjectives() {
    return <Objectives
      parent={null}
      {...this.props}
      model={this.props.model.head.objrefs}
      onEdit={this.onObjectivesEdit}
      />;
  }

  componentWillReceiveProps(nextProps: WorkbookPageEditorProps) {

    if (nextProps.model !== this.props.model) {
      if (this.hasMissingObjective(
        nextProps.model.head.objrefs, nextProps.context.objectives)) {

        nextProps.services.refreshObjectives(nextProps.context.courseId);
      }
    }
  }

  onFocus(model, parent) {
    console.log('focus gained');
    this.props.onUpdateContentSelection(this.props.context.documentId, model, parent);
  }

  renderContentTab() {
    return (
      <div key="content-tab" className="html-editor-well">
        <div className="flex-spacer">
        <ContentContainer
          parent={null}
          onFocus={this.onFocus.bind(this)}
          editMode={this.props.editMode}
          services={this.props.services}
          context={this.props.context}
          model={this.props.model.body}
          onEdit={c => this.onBodyEdit(c)} />
        </div>
      </div>
    );
  }

  renderDetailsTab() {
    return (
      <div key="details-tab">
        <Details
          {...this.props}
          model={this.props.model}
          editMode={this.props.editMode}
          onEdit={this.onModelEdit}/>
      </div>
    );
  }

  renderObjectivesTab() {
    return (
      <div key="objectives-tab">
        {this.renderObjectives()}
      </div>
    );
  }

  renderActionsTab() {
    return (
      <div key="actions-tab">
        <Actions onPreview={() =>
          this.props.preview(this.props.context.courseId, this.props.model.resource)}/>
      </div>
    );
  }

  render() {
    const text = this.props.model.head.title.text.extractPlainText().caseOf({
      just: s => s,
      nothing: () => '',
    });

    return (
      <div className="workbookpage-editor">
        <h2 className="title-row">{text}</h2>
        <ContextAwareToolbar />
        {this.renderContentTab()}
      </div>
    );
  }

}

export default WorkbookPageEditor;
