import * as React from 'react';
import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';

import { AbstractEditor, AbstractEditorProps, AbstractEditorState } from '../common/AbstractEditor';
import * as models from '../../../data/models';
import * as contentTypes from '../../../data/contentTypes';
import { UndoRedoToolbar } from '../common/UndoRedoToolbar';
import { AddQuestion } from '../../content/question/AddQuestion';
import { Outline } from '../assessment/Outline';
import { TitleContentEditor } from '../../content/title/TitleContentEditor';
import guid from '../../../utils/guid';
import { DragDropContext } from 'react-dnd';
import { renderAssessmentNode } from '../common/questions';
import { findNodeByGuid } from '../assessment/utils';
import { hasUnknownSkill } from 'utils/skills';
import { Skill } from 'types/course';

import HTML5Backend from 'react-dnd-html5-backend';

import './PoolEditor.scss';

interface PoolEditor {

}

export interface PoolEditorProps extends AbstractEditorProps<models.PoolModel> {
  onFetchSkills: (courseId: string) => void;
  skills: Immutable.OrderedMap<string, Skill>;
}

interface PoolEditorState extends AbstractEditorState {
  currentNode: contentTypes.Node;
}

@DragDropContext(HTML5Backend)
class PoolEditor extends AbstractEditor<models.PoolModel,
  PoolEditorProps,
  PoolEditorState>  {

  pendingCurrentNode: Maybe<contentTypes.Question>;

  constructor(props) {
    super(props, { currentNode: props.model.pool.questions.first() });

    this.onEdit = this.onEdit.bind(this);
    this.onRemove = this.onRemove.bind(this);
    this.onEditNodes = this.onEditNodes.bind(this);
    this.onTitleEdit = this.onTitleEdit.bind(this);
    this.onSelect = this.onSelect.bind(this);
    this.onChangeExpansion = this.onChangeExpansion.bind(this);

    this.pendingCurrentNode = Maybe.nothing<contentTypes.Question>();

    if (hasUnknownSkill(props.model, props.skills)) {
      props.onFetchSkills(props.context.courseId);
    }
  }


  componentWillReceiveProps(nextProps: PoolEditorProps) {

    findNodeByGuid(nextProps.model.pool.questions, this.state.currentNode.guid)
      .lift(currentNode => this.setState({ currentNode }));

    this.pendingCurrentNode
      .lift((currentNode) => {
        this.pendingCurrentNode = Maybe.nothing<contentTypes.Question>();
        this.setState({ currentNode });
      });
  }

  addQuestion(q) {

    const pool = this.props.model.pool.with(
      { questions: this.props.model.pool.questions.set(q.guid, q) });
    const updated = this.props.model.with({ pool });

    this.pendingCurrentNode = Maybe.just(q);
    this.handleEdit(updated);
  }

  onTitleEdit(title) {
    const resource = this.props.model.resource.with({ title: title.text });
    const pool = this.props.model.pool.with({ title });
    const updated = this.props.model.with({ pool, resource });
    this.handleEdit(updated);
  }

  onEdit(guid : string, question : contentTypes.Question) {

    const questions = this.props.model.pool.questions.set(guid, question);
    const pool = this.props.model.pool.with({ questions });
    this.handleEdit(this.props.model.with({ pool }));
  }

  onEditNodes(questions: Immutable.OrderedMap<string, contentTypes.Question>) {

    const pool = this.props.model.pool.with({ questions });
    this.handleEdit(this.props.model.with({ pool }));
  }

  onChangeExpansion(nodes: Immutable.Set<string>) {
    // Nothing to do here, as we are not allowing changing the
    // expanded state of nodes in the outline
  }

  onSelect(currentNode: contentTypes.Node) {
    this.setState({ currentNode });
  }

  onRemove(guid: string) {

    const { model } = this.props;

    if (model.pool.questions.size > 1) {

      const pool = model.pool.with({ questions: model.pool.questions.delete(guid) });

      // Pick a new node to be the current node

      // Find the index where the question to remove is located
      const index = this.props.model.pool.questions
        .toArray()
        .findIndex(q => q.guid === guid);

      // Account for the case that the question removed was last
      const adjustedIndex = pool.questions.size === index ? index - 1 : index;

      // Get the node at the adjusted index
      const newCurrent = pool.questions
        .toArray()[adjustedIndex];

      // Set it to be the new current (pending)
      this.pendingCurrentNode = Maybe.just(newCurrent);

      this.handleEdit(this.props.model.with({ pool }));
    }

  }

  render() {

    const { model } = this.props;

    // We currently do not allow expanding / collapsing in the outline,
    // so we simply tell the outline to expand every node.
    const expanded = Immutable.Set<string>(model.pool.questions.toArray().map(n => n.guid));

    return (
      <div className="pool-editor">
        <div className="docHead">
          <UndoRedoToolbar
              undoEnabled={this.state.undoStackSize > 0}
              redoEnabled={this.state.redoStackSize > 0}
              onUndo={this.undo.bind(this)} onRedo={this.redo.bind(this)}/>
          <TitleContentEditor
              services={this.props.services}
              context={this.props.context}
              editMode={this.props.editMode}
              model={this.props.model.pool.title}
              onEdit={this.onTitleEdit}
              />
          <AddQuestion
            editMode={this.props.editMode}
            onQuestionAdd={this.addQuestion.bind(this)}
            isSummative={true}/>

          <div className="outline">
            <div className="outlineContainer">
              <Outline
                editMode={this.props.editMode}
                nodes={model.pool.questions}
                expandedNodes={expanded}
                selected={this.state.currentNode.guid}
                onEdit={this.onEditNodes.bind(this)}
                onChangeExpansion={this.onChangeExpansion.bind(this)}
                onSelect={this.onSelect.bind(this)}
                />
            </div>
            <div className="nodeContainer">
              {renderAssessmentNode(
                this.state.currentNode, this.props, this.onEdit, this.onRemove)}
            </div>
          </div>
        </div>
      </div>
    );
  }

}

export default PoolEditor;
