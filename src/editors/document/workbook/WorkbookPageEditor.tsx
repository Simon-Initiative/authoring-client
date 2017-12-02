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
import { LegacyTypes } from 'data/types';

import './WorkbookPageEditor.scss';

export interface WorkbookPageEditorProps extends AbstractEditorProps<models.WorkbookPageModel> {
  fetchObjectives: (courseId: string) => void;
}

interface WorkbookPageEditorState extends AbstractEditorState {}

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
  }

  shouldComponentUpdate(nextProps: WorkbookPageEditorProps) : boolean {
    if (this.props.model !== nextProps.model) {
      return true;
    }
    if (this.props.editMode !== nextProps.editMode) {
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

  onObjectivesEdit(objectives: Immutable.Set<contentTypes.LearningObjective>) {
    this.props.services.dismissModal();

    const head = this.props.model.head.with(
      { objrefs: objectives.map(o => o.id).toList() });
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
    const objectives = this.props.model.head.objrefs.toArray()
      .map((id) => {
        const title = this.props.context.objectives.has(id)
          ? this.props.context.objectives.get(id).title
          : 'Loading...';
        return <li key={id}>{title}</li>;
      });
    return (
      <ol>
        {objectives}
      </ol>
    );
  }

  componentWillReceiveProps(nextProps: WorkbookPageEditorProps) {

    if (nextProps.model !== this.props.model) {
      if (this.hasMissingObjective(
        nextProps.model.head.objrefs, nextProps.context.objectives)) {

        nextProps.services.refreshObjectives(nextProps.context.courseId);
      }
    }
  }

  selectObjectives() {
    const component = <ObjectiveSelection
      onInsert={this.onObjectivesEdit}
      onCancel={() => this.props.services.dismissModal()}
      courseId={this.props.context.courseId} />;

    this.props.services.displayModal(component);
  }

  render() {
    const inlineToolbar = <InlineToolbar />;
    const blockToolbar = <BlockToolbar />;
    const insertionToolbar = <InlineInsertionToolbar />;

    const addLearningObj = <button
      className="btn btn-link"
      onClick={() => this.selectObjectives()}>Edit Learning Objectives</button>;

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

          <Collapse
            caption="Learning Objectives"
            expanded={addLearningObj}>

            {this.renderObjectives()}

          </Collapse>

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
