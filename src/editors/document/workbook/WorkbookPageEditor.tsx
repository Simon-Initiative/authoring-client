import * as React from 'react';
import * as Immutable from 'immutable';

import { AbstractEditor, AbstractEditorProps, AbstractEditorState } from '../common/AbstractEditor';
import { HtmlContentEditor } from '../../content/html/HtmlContentEditor';
import { TitleContentEditor } from '../../content/title/TitleContentEditor';
import InlineToolbar  from './InlineToolbar';
import BlockToolbar  from './BlockToolbar';
import InlineInsertionToolbar from './InlineInsertionToolbar';
import { UndoRedoToolbar } from '../common/UndoRedoToolbar';
import * as persistence from 'data/persistence';
import { Resource } from 'data/content/resource';
import { Collapse } from '../../content/common/Collapse';
import { AuthoringActionsHandler, AuthoringActions } from 'actions/authoring';
import { ObjectiveSelection } from 'utils/selection/ObjectiveSelection';
import * as models from 'data/models';
import * as contentTypes from 'data/contentTypes';
import { ContentState, ContentBlock } from 'draft-js';
import { LegacyTypes } from 'data/types';
import { getEntities } from 'data/content/html/changes';
import { EntityTypes } from 'data/content/html/common';
import { Objectives } from './Objectives';

import './WorkbookPageEditor.scss';

export interface WorkbookPageEditorProps extends AbstractEditorProps<models.WorkbookPageModel> {
  fetchObjectives: (courseId: string) => void;
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

    this.onTitleEdit = this.onTitleEdit.bind(this);
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

  onTitleEdit(title) {
    const resource = this.props.model.resource.with({ title: title.text });
    const head = this.props.model.head.with({ title });
    this.handleEdit(this.props.model.with({ head, resource }));
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


  render() {
    const inlineToolbar = <InlineToolbar />;
    const blockToolbar = <BlockToolbar />;
    const insertionToolbar = <InlineInsertionToolbar />;

    return (
      <div className="workbookpage-editor">
          <UndoRedoToolbar
            undoEnabled={this.state.undoStackSize > 0}
            redoEnabled={this.state.redoStackSize > 0}
            onUndo={this.undo.bind(this)} onRedo={this.redo.bind(this)} />
          <TitleContentEditor
            services={this.props.services}
            context={this.props.context}
            editMode={this.props.editMode}
            model={this.props.model.head.title}
            onEdit={this.onTitleEdit} />

          {this.renderObjectives()}

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

}

export default WorkbookPageEditor;
