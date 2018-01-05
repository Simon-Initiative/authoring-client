import * as React from 'react';
import * as Immutable from 'immutable';

import { AbstractEditor, AbstractEditorProps, AbstractEditorState } from '../common/AbstractEditor';
import { HtmlContentEditor } from '../../content/html/HtmlContentEditor';
import InlineToolbar from './InlineToolbar';
import BlockToolbar from './BlockToolbar';
import InlineInsertionToolbar from './InlineInsertionToolbar';
import { UndoRedoToolbar } from '../common/UndoRedoToolbar';
import { Resource } from 'data/content/resource';
import * as models from 'data/models';
import * as contentTypes from 'data/contentTypes';
import { ContentState } from 'draft-js';
import { getEntities } from 'data/content/html/changes';
import { EntityTypes } from 'data/content/html/common';
import { Objectives } from './Objectives';
import { TabContainer } from '../../content/common/TabContainer';
import { Details } from './Details';
import { Actions } from './Actions';

import './WorkbookPageEditor.scss';

export interface WorkbookPageEditorProps extends AbstractEditorProps<models.WorkbookPageModel> {
  fetchObjectives: (courseId: string) => void;
  preview: (courseId: string, resource: Resource) => Promise<any>;
}

interface WorkbookPageEditorState extends AbstractEditorState {}

function hasMissingResource(
  contentState: ContentState, course: models.CourseModel) : boolean {

  const missingActivity = getEntities(EntityTypes.activity, contentState)
    .some(e => !course.resourcesById.has(e.entity.data.activity.idRef));

  getEntities(EntityTypes.wb_inline, contentState)
    .forEach(e => console.log(e));

  return missingActivity ||
    getEntities(EntityTypes.wb_inline, contentState)
      .some(e => !course.resourcesById.has(e.entity.data.wbinline.idRef));
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
    if (hasMissingResource(
      props.model.body.contentState, props.context.courseModel)) {
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

  renderContentTab() {
    const inlineToolbar = <InlineToolbar />;
    const blockToolbar = <BlockToolbar />;
    const insertionToolbar = <InlineInsertionToolbar />;

    return (
      <div className="html-editor-well">
        <HtmlContentEditor
          inlineToolbar={inlineToolbar}
          inlineInsertionToolbar={insertionToolbar}
          blockToolbar={blockToolbar}
          editMode={this.props.editMode}
          services={this.props.services}
          context={this.props.context}
          model={this.props.model.body}
          onEdit={c => this.onBodyEdit(c)} />
      </div>
    );
  }

  renderDetailsTab() {
    return <Details
      model={this.props.model}
      editMode={this.props.editMode}
      onEdit={this.onModelEdit}/>;
  }

  renderObjectivesTab() {
    return this.renderObjectives();
  }

  renderActionsTab() {
    return <Actions onPreview={() =>
      this.props.preview(this.props.context.courseId, this.props.model.resource)}/>;
  }

  render() {

    const labels = ['Content', 'Details', 'Objectives', 'Actions'];
    const tabs = [
      this.renderContentTab(),
      this.renderDetailsTab(),
      this.renderObjectivesTab(),
      this.renderActionsTab(),
    ];

    return (
      <div className="workbookpage-editor">
          <div className="title-row">
            <h3>Page: {this.props.model.head.title.text}</h3>
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
