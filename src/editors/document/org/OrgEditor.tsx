import * as React from 'react';
import * as Immutable from 'immutable';

import { AbstractEditor, AbstractEditorProps, AbstractEditorState } from '../common/AbstractEditor';
import * as models from '../../../data/models';
import { viewDocument } from '../../../actions/view';
import { UndoRedoToolbar } from '../common/UndoRedoToolbar';
import * as contentTypes from '../../../data/contentTypes';
import { Command } from './commands/command';
import { getExpandId, render } from './traversal';
import { collapseNodes, expandNodes } from '../../../actions/expand';
import { SourceNodeType } from '../../content/org/drag/utils';
import { insertNode, removeNode, updateNode } from './utils';
import { TreeNode } from './TreeNode';
import { Actions } from './Actions.controller';
import { Details } from './Details';
import { LabelsEditor } from '../../content/org/LabelsEditor';
import { Title } from 'types/course';
import { duplicateOrganization } from 'actions/models';

import './OrgEditor.scss';
import { CourseId } from 'data/types';

function isNumberedNodeType(node: any) {
  return (node.contentType === contentTypes.OrganizationContentTypes.Unit
    || node.contentType === contentTypes.OrganizationContentTypes.Module
    || node.contentType === contentTypes.OrganizationContentTypes.Section
    || node.contentType === contentTypes.OrganizationContentTypes.Sequence);
}

function calculatePositionsAtLevel(
  model: models.OrganizationModel, allNodeIds: string[],
  idMap: Object, parentMap: Object): Object {

  const positions = {};
  const positionAtLevels = {};

  const arr = model.sequences.children.toArray();

  arr.map((n, i) => {
    parentMap[n.guid] = model.sequences;
    calculatePositionsAtLevelHelper(
      n, i, 0, positions, positionAtLevels, allNodeIds, idMap, parentMap);
  });

  return positions;
}

function hasMissingResource(
  model: models.OrganizationModel, course: models.CourseModel): boolean {

  return model.sequences.children
    .toArray()
    .map(c => hasMissingResourceHelper(model, course, c))
    .reduce((all, result) => all || result, false);
}

function hasMissingResourceHelper(
  model: models.OrganizationModel, course: models.CourseModel,
  node: any): boolean {

  if (node.contentType === 'Item') {
    return !course.resourcesById.has(node.resourceref.idref);
  }
  if (node.children !== undefined) {
    return node.children
      .toArray()
      .map(c => hasMissingResourceHelper(model, course, c))
      .reduce((all, result) => all || result, false);
  }

  return false;
}

function calculatePositionsAtLevelHelper(
  node: any, index: number, level: number,
  positions: Object, positionAtLevels: Object, allNodeIds: string[],
  idMap: Object, parentMap: Object): void {

  if (isNumberedNodeType(node)) {
    if (positionAtLevels[level] === undefined) {
      positionAtLevels[level] = 1;
    } else {
      positionAtLevels[level] = positionAtLevels[level] + 1;
    }

    positions[node.guid] = positionAtLevels[level];
  }

  idMap[node.id] = node;

  allNodeIds.push(node.id);

  if (node.children !== undefined) {

    node.children.toArray()
      .map(c => parentMap[c.guid] = node);

    node.children.toArray()
      .map((n, i) => calculatePositionsAtLevelHelper(
        n, i, level + 1, positions, positionAtLevels, allNodeIds, idMap, parentMap));
  }
}

function identifyNewNodes(last: string[], current: string[]): string[] {

  const lastMap = last.reduce((p, c) => { p[c] = true; return p; }, {});
  return current.filter(c => lastMap[c] === undefined);
}

export interface OrgEditorProps extends AbstractEditorProps<models.OrganizationModel> {
  onUpdateTitle: (title: Title) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: (documentId: string) => void;
  onRedo: (documentId: string) => void;
  onPreview: (courseId: CourseId, organization: models.OrganizationModel) => Promise<any>;
  course: models.CourseModel;
}

const enum TABS {
  Content = 0,
  Details = 1,
  Labels = 2,
  Actions = 3,
}

interface OrgEditorState extends AbstractEditorState {
  currentTab: TABS;
  highlightedNodes: Immutable.Set<string>;
}

class OrgEditor extends AbstractEditor<models.OrganizationModel,
  OrgEditorProps,
  OrgEditorState>  {
  pendingHighlightedNodes: Immutable.Set<string>;
  positionsAtLevel: Object;
  allNodeIds: string[];
  idMap: Object;
  parentMap: Object;

  constructor(props: OrgEditorProps) {
    super(props, ({
      currentTab: TABS.Content,
      highlightedNodes: Immutable.Set<string>(),
    } as OrgEditorState));

    this.onLabelsEdit = this.onLabelsEdit.bind(this);
    this.onNodeEdit = this.onNodeEdit.bind(this);
    this.onAddSequence = this.onAddSequence.bind(this);
    this.onCollapse = this.onCollapse.bind(this);
    this.onExpand = this.onExpand.bind(this);
    this.onViewEdit = this.onViewEdit.bind(this);

    this.pendingHighlightedNodes = null;

    this.allNodeIds = [];
    this.idMap = {};
    this.parentMap = {};
    this.positionsAtLevel = calculatePositionsAtLevel(
      this.props.model, this.allNodeIds, this.idMap, this.parentMap);

    if (hasMissingResource(props.model, props.context.courseModel)) {
      props.services.refreshCourse(props.context.courseId);
    }
  }

  onReposition(sourceNode: Object, sourceParentGuid: string, targetModel: any, index: number) {

    let adjustedIndex = index;
    if (sourceParentGuid === targetModel.guid) {
      // Find the item's original index to see if this is a move downward
      let i = 0;
      const arr = targetModel.children.toArray();
      for (i = 0; i < arr.length; i += 1) {
        if (arr[i].guid === (sourceNode as any).guid) {
          break;
        }
      }
      if (i < index) {
        adjustedIndex = index - 1;
      }
    }

    const removed = removeNode(this.props.model, (sourceNode as any).guid);
    const inserted = insertNode(removed, targetModel.guid, sourceNode, adjustedIndex);

    this.highlightNode(sourceNode as any);
    this.handleEdit(inserted);

  }

  highlightNode(node: SourceNodeType) {
    this.pendingHighlightedNodes = Immutable.Set<string>().add(node.guid);
  }

  toggleExpanded(guid) {

    const action = this.props.expanded.caseOf({
      just: set => set.has(guid) ? collapseNodes : expandNodes,
      nothing: () => expandNodes,
    });
    this.props.dispatch(action(this.props.context.documentId, [guid]));
  }

  processCommand(model, command: Command) {

    const delay = () =>
      command.execute(this.props.model, model, this.props.context, this.props.services)
        .then(org => this.handleEdit(org));

    setTimeout(delay, 0);
  }

  componentWillReceiveProps(nextProps) {

    if (this.props.model !== nextProps.model) {
      // Recalculate the position of the nodes ad each level. Doing this here
      // avoids having to do this on ever render.

      const lastAllNodes = this.allNodeIds;
      this.allNodeIds = [];
      this.idMap = {};
      this.parentMap = {};

      this.positionsAtLevel = calculatePositionsAtLevel(
        nextProps.model, this.allNodeIds, this.idMap, this.parentMap);

      const newNodes = identifyNewNodes(lastAllNodes, this.allNodeIds);
      if (newNodes.length > 0) {

        if (this.pendingHighlightedNodes === null) {
          this.pendingHighlightedNodes
            = Immutable.Set.of(...newNodes.map(id => this.idMap[id].guid));
        } else {
          this.pendingHighlightedNodes = this.pendingHighlightedNodes
            .union(Immutable.Set.of(...newNodes.map(id => this.idMap[id].guid)));
        }

        // As long as the new nodes were not the result of an undo or redo,
        // expand their parent node so that the new nodes are visible
        if (this.props.context.undoRedoGuid === nextProps.context.undoRedoGuid) {
          this.props.dispatch(
            expandNodes(this.props.context.documentId, newNodes
              .map(id => this.parentMap[this.idMap[id].guid].id)));
        }
      }
    }

    if (this.pendingHighlightedNodes !== null) {

      const removeHighlight = () => this.setState({ highlightedNodes: Immutable.Set<string>() });

      this.setState(
        { highlightedNodes: this.pendingHighlightedNodes },
        () => setTimeout(removeHighlight, 1000));

      this.pendingHighlightedNodes = null;
    }

  }

  onViewEdit(id) {
    this.props.services.fetchGuidById(id)
      .then(guid => this.props.dispatch(viewDocument(guid, this.props.context.courseId)));
  }

  onNodeEdit(node) {
    this.handleEdit(updateNode(this.props.model, node));
  }

  renderContent() {
    const isExpanded = guid => this.props.expanded.caseOf({
      just: v => v.has(guid),
      nothing: () => false,
    });

    const renderNode = (node, parent, index, depth, numberAtLevel) => {
      return <TreeNode
        key={node.guid}
        onViewEdit={this.onViewEdit}
        numberAtLevel={numberAtLevel}
        highlighted={this.state.highlightedNodes.has(node.guid)}
        labels={this.props.model.labels}
        model={node}
        org={this.props.model}
        context={this.props.context}
        parentModel={parent}
        onEdit={this.onNodeEdit}
        editMode={this.props.editMode}
        processCommand={this.processCommand.bind(this, node)}
        toggleExpanded={this.toggleExpanded.bind(this)}
        isExpanded={isExpanded(getExpandId(node))}
        onReposition={this.onReposition.bind(this)}
        indexWithinParent={index}
        depth={depth} />;
    };

    return (
      <div className="organization-content">
        {this.renderActionBar()}

        <table className="table table-sm">
          <tbody>

            {render(
              this.props.model.sequences,
              isExpanded, renderNode, this.positionsAtLevel)}

          </tbody>
        </table>
      </div>
    );
  }

  componentDidMount() {
    super.componentDidMount();

    this.props.expanded.caseOf({
      just: v => false,
      nothing: () => this.props.dispatch(
        expandNodes(
          this.props.context.documentId,
          this.props.model.sequences.children.toArray().map(s => getExpandId(s)))),
    });
  }

  renderDetails() {
    return (
      <div className="org-tab">
        <Details
          editMode={this.props.editMode}
          model={this.props.model}
          onEdit={model => this.handleEdit(model)} />
      </div>
    );
  }

  onLabelsEdit(labels) {
    this.handleEdit(this.props.model.with({ labels }));
  }

  renderLabels() {
    return (
      <div className="org-tab">
        <LabelsEditor
          {...this.props}
          activeContentGuid={null}
          hover={null}
          onUpdateHover={() => { }}
          parent={null}
          onFocus={this.onFocus.bind(this)}
          onEdit={this.onLabelsEdit} model={this.props.model.labels} />
      </div>
    );
  }

  onFocus(child, parent) {

  }

  renderConstraints() {
    return <p>TBD Constraint Editor</p>;
  }

  renderActionBar() {
    return (
      <div className="action-bar">
        <button key="add" className="btn btn-link"
          disabled={!this.props.editMode} onClick={this.onAddSequence}>
          <i className="fa fa-plus" />Add {this.props.model.labels.sequence}
        </button>
        <button key="expand" className="btn btn-link" onClick={this.onExpand}>
          <i className="fa fa-chevron-down" />Expand All
        </button>
        <button key="collapse" className="btn btn-link"
          onClick={this.onCollapse}>
          <i className="fa fa-chevron-up" />Collapse All
        </button>
      </div>
    );
  }

  onAddSequence() {
    const s: contentTypes.Sequence = new contentTypes.Sequence()
      .with({ title: 'New ' + this.props.model.labels.sequence });
    const sequences = this.props.model.sequences
      .with({ children: this.props.model.sequences.children.set(s.guid, s) });

    this.handleEdit(this.props.model.with({ sequences }));
  }

  onExpand() {
    this.props.dispatch(
      expandNodes(this.props.context.documentId, this.allNodeIds));
  }

  onCollapse() {
    this.props.dispatch(
      collapseNodes(this.props.context.documentId, this.allNodeIds));
  }

  onTabClick(index: number) {
    this.setState({ currentTab: index });
  }

  renderTabs() {

    const tabs = ['Content', 'Details', 'Labels', 'Actions']
      .map((title, index) => {
        const active = index === this.state.currentTab ? 'active' : '';
        const classes = 'nav-link ' + active;
        return (
          <a
            key={title}
            className={classes}
            onClick={this.onTabClick.bind(this, index)}>
            {title}
          </a>
        );
      });

    return (
      <ul className="nav nav-tabs">
        {tabs}
      </ul>
    );
  }

  renderActions() {
    const { dispatch, model, context } = this.props;

    const dupe = () => dispatch(
      duplicateOrganization(
        context.courseId,
        model, context.courseModel));

    return (
      <Actions
        onDuplicate={dupe}
        org={model}
        course={this.props.course}
        onPreview={this.props.onPreview}
      />);
  }

  renderActiveTabContent() {
    switch (this.state.currentTab) {
      case TABS.Content:
        return this.renderContent();
      case TABS.Details:
        return this.renderDetails();
      case TABS.Labels:
        return this.renderLabels();
      case TABS.Actions:
        return this.renderActions();
    }
  }

  render() {

    const { canUndo, canRedo, onUndo, onRedo } = this.props;
    const documentId = this.props.context.documentId;

    return (
      <div className="org-editor">
        <div className="doc-head">
          <UndoRedoToolbar
            undoEnabled={canUndo}
            redoEnabled={canRedo}
            onUndo={onUndo.bind(this, documentId)}
            onRedo={onRedo.bind(this, documentId)} />

          <h3>Organization: {this.props.model.title}</h3>

          {this.renderTabs()}

          <div className="active-tab-content">
            {this.renderActiveTabContent()}
          </div>

        </div>
      </div>);

  }

}

export default OrgEditor;

