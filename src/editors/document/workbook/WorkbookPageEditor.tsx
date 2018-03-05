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
import { ActiveContext, ParentContainer } from 'types/active';

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

    console.dir(model.toPersistence());
    console.dir(source);

    this.props.onUpdateContent(this.props.context.documentId, source);
    this.handleEdit(model);
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
    this.props.onUpdateContentSelection(this.props.context.documentId, model, parent);
  }

  renderContentTab() {

    const activeGuid = this.props.activeContext.activeChild.caseOf({
      just: c => (c as any).guid,
      nothing: () => '',
    });

    return (
      <div key="content-tab" className="html-editor-well">
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

    const labels = ['Content', 'Details', 'Objectives', 'Actions'];
    const tabs = [
      this.renderContentTab(),
      this.renderDetailsTab(),
      this.renderObjectivesTab(),
      this.renderActionsTab(),
    ];

    const text = this.props.model.head.title.text.extractPlainText().caseOf({
      just: s => s,
      nothing: () => '',
    });

    return (
      <div className="workbookpage-editor">
          <div className="title-row">
            <h3>Page: {text}</h3>
            <div className="flex-spacer"/>
            <UndoRedoToolbar
              undoEnabled={this.state.undoStackSize > 0}
              redoEnabled={this.state.redoStackSize > 0}
              onUndo={this.undo.bind(this)} onRedo={this.redo.bind(this)} />
          </div>

          <TabContainer labels={labels}>
            {tabs}
          </TabContainer>
      </div>
    );
  }

}

export default WorkbookPageEditor;
