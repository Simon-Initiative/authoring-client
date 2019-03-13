import * as React from 'react';
import * as Immutable from 'immutable';

import * as models from 'data/models';
import { viewDocument } from 'actions/view';
import * as contentTypes from 'data/contentTypes';
import { getExpandId, render, NodeTypes } from 'editors/document/org/traversal';
import { collapseNodes, expandNodes } from 'actions/expand';
import { SourceNodeType } from 'editors/content/org/drag/utils';
import { TreeNode } from 'editors/document/org/TreeNode';
import * as Messages from 'types/messages';
import * as org from 'data/models/utils/org';

import { AppServices } from 'editors/common/AppServices';
import { AppContext } from 'editors/common/AppContext';
import { Maybe } from 'tsmonad';
import { NavigationItem } from 'types/navigation';

import './OrgEditor.scss';
import { Tooltip } from 'utils/tooltip';

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

export interface OrgEditorProps {
  selectedItem: Maybe<NavigationItem>;
  model: models.OrganizationModel;
  onEdit: (request: org.OrgChangeRequest) => void;
  services: AppServices;
  context: AppContext;
  editMode: boolean;
  dispatch: any;
  expanded: Maybe<Immutable.Set<string>>;
  showMessage: (message: Messages.Message) => void;
  dismissMessage: (message: Messages.Message) => void;
  dismissModal: () => void;
  displayModal: (c) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: (documentId: string) => void;
  onRedo: (documentId: string) => void;
  course: models.CourseModel;
  onEditingEnable: (editable: boolean, documentId: string) => void;
}

const enum TABS {
  Content = 0,
  Details = 1,
  Labels = 2,
  Actions = 3,
}

interface OrgEditorState {
  currentTab: TABS;
  highlightedNodes: Immutable.Set<string>;
  undoStackSize: number;
  redoStackSize: number;
}

class OrgEditor extends React.Component<OrgEditorProps,
  OrgEditorState>  {

  pendingHighlightedNodes: Immutable.Set<string>;
  positionsAtLevel: Object;
  allNodeIds: string[];
  idMap: Object;
  parentMap: Object;

  constructor(props: OrgEditorProps) {
    super(props);

    this.onNodeEdit = this.onNodeEdit.bind(this);
    this.onClickComponent = this.onClickComponent.bind(this);

    this.pendingHighlightedNodes = null;

    this.allNodeIds = [];
    this.idMap = {};
    this.parentMap = {};
    this.positionsAtLevel = calculatePositionsAtLevel(
      this.props.model, this.allNodeIds, this.idMap, this.parentMap);

    if (hasMissingResource(props.model, props.context.courseModel)) {
      props.services.refreshCourse(props.context.courseId);
    }

    this.state = {
      currentTab: TABS.Content,
      highlightedNodes: Immutable.Set<string>(),
      undoStackSize: 0,
      redoStackSize: 0,
    };
  }

  componentDidMount() {
    // If the page has not been viewed yet or custom expand/collapse state has not been set by the
    // user, expand the top-level nodes
    this.props.expanded.caseOf({
      just: expandedNodes => null,
      nothing: () => this.expandFirstTwoLevels(),
    });
  }

  expandFirstTwoLevels() {
    const ids = [];
    this.props.model.sequences.children.toArray().forEach(
      (c) => {
        const id = (c as any).id;
        if (id !== undefined) {
          ids.push(id);
          const children = (c as any).children;
          if (children !== undefined) {
            children.toArray().forEach((s) => {
              const id = (s as any).id;
              if (id !== undefined) {
                ids.push(id);
              }
            });
          }
        }
      });
    this.props.dispatch(
      expandNodes(this.props.context.documentId, ids));
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

    const request = org.makeMoveNode(sourceNode as org.OrgNode, targetModel.id, adjustedIndex);
    this.props.onEdit(request);

    this.highlightNode(sourceNode as any);

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

      // As long as we are still using the same actual document, indentify
      // newly added nodes so that we can highlight them:

      if (this.props.model.guid === nextProps.model.guid) {
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


    }

    if (this.pendingHighlightedNodes !== null) {

      const removeHighlight = () => this.setState({ highlightedNodes: Immutable.Set<string>() });

      this.setState(
        { highlightedNodes: this.pendingHighlightedNodes },
        () => setTimeout(removeHighlight, 1000));

      this.pendingHighlightedNodes = null;
    }

  }

  onClickComponent(model: NodeTypes) {

    if (model.contentType === 'Item') {
      this.props.services.fetchGuidById(model.resourceref.idref)
        .then(guid => this.props.dispatch(
          viewDocument(guid, this.props.context.courseId, this.props.model.guid)));
    } else {
      const id = this.props.selectedItem.caseOf({
        just: (item) => {
          if (item.type === 'OrganizationItem') {
            return item.id;
          }
          return null;
        },
        nothing: () => null,
      });

      const componentId = (model as any).id;
      if (componentId === id) {
        this.toggleExpanded(componentId);
      } else {
        this.props.dispatch(
          viewDocument(componentId, this.props.context.courseId, this.props.model.guid));
      }

    }
  }

  onNodeEdit(request: org.OrgChangeRequest) {
    this.props.onEdit(request);
  }

  renderContent() {

    const { selectedItem } = this.props;
    const isExpanded = guid => this.props.expanded.caseOf({
      just: v => v.has(guid),
      nothing: () => false,
    });

    // This id will either be a resource guid or the id of a unit, module, section
    const id = selectedItem && selectedItem.caseOf({
      just: (item) => {
        if (item.type === 'OrganizationItem') {
          return item.id;
        }
        return null;
      },
      nothing: () => null,
    });

    const renderNode = (node, parent, index, depth, numberAtLevel) => {

      let isSelected = false;
      if (node.contentType === 'Item') {
        const res = this.props.context.courseModel
          .resourcesById.get(node.resourceref.idref);
        isSelected = res !== undefined ? res.guid === id : false;
      } else {
        isSelected = node.id === id;
      }

      return <Tooltip
        title={node.title}
        delay={200}
        offset={30}
        distance={- depth * 20 - 10}
        size="regular"
        position="right"
        arrow={false}
        theme="light"
        style={{ overflow: 'visible' }}>
        <TreeNode
          isSelected={isSelected}
          key={node.guid}
          onClick={this.onClickComponent}
          numberAtLevel={numberAtLevel}
          highlighted={this.state.highlightedNodes.has(node.guid)}
          labels={this.props.model.labels}
          model={node}
          org={this.props.model}
          context={this.props.context}
          parentModel={parent}
          onEdit={this.onNodeEdit}
          editMode={this.props.editMode}
          isExpanded={isExpanded(getExpandId(node))}
          onReposition={this.onReposition.bind(this)}
          indexWithinParent={index}
          depth={depth} />
      </Tooltip>;
    };

    return (
      <table className="table table-sm">
        <tbody>
          {render(
            this.props.model.sequences,
            isExpanded, renderNode, this.positionsAtLevel)}
        </tbody>
      </table>
    );
  }


  render() {
    return (
      <div className="org-editor">
        {this.renderContent()}
      </div>
    );
  }

}

export default OrgEditor;
