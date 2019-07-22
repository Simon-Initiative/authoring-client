import * as React from 'react';
import * as Immutable from 'immutable';

import * as models from 'data/models';
import { viewDocument } from 'actions/view';
import { getExpandId, render, NodeTypes } from 'editors/document/org/traversal';
import { collapseNodes, expandNodes } from 'actions/expand';
import { SourceNodeType } from 'editors/content/org/drag/utils';
import { TreeNode } from 'editors/document/org/TreeNode';
import * as Messages from 'types/messages';
import * as org from 'data/models/utils/org';
import * as commands from './commands/map';

import { AppServices } from 'editors/common/AppServices';
import { AppContext } from 'editors/common/AppContext';
import { Maybe } from 'tsmonad';
import { NavigationItem, OrganizationItem } from 'types/navigation';
import { Command } from './commands/command';

import './OrgEditor.scss';
import { OrganizationModel } from 'data/models/org';
import { Tooltip } from 'utils/tooltip';

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

function identifyNewNodes(last: org.Placements, current: org.Placements): org.Placement[] {

  const lastMap = last.reduce((p, c) => { p[c.node.id] = true; return p; }, {});
  return current.toArray()
    .filter(c => lastMap[c.node.id] === undefined);
}

export interface OrgEditorProps {
  selectedItem: Maybe<NavigationItem>;
  model: models.OrganizationModel;
  placements: org.Placements;
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
  onDispatch: () => void;
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
  selectedNode: Maybe<NodeTypes>;
}

class OrgEditor extends React.Component<OrgEditorProps, OrgEditorState>  {

  pendingHighlightedNodes: Immutable.Set<string>;

  constructor(props: OrgEditorProps) {
    super(props);

    this.onNodeEdit = this.onNodeEdit.bind(this);
    this.onSelectComponent = this.onSelectComponent.bind(this);

    this.pendingHighlightedNodes = null;

    if (hasMissingResource(props.model, props.context.courseModel)) {
      props.services.refreshCourse(props.context.courseModel.guid);
    }

    this.state = {
      currentTab: TABS.Content,
      highlightedNodes: Immutable.Set<string>(),
      undoStackSize: 0,
      redoStackSize: 0,
      selectedNode: Maybe.nothing(),
    };
  }

  componentDidMount() {
    // If the page has not been viewed yet or custom expand/collapse state has not been set by the
    // user, expand all the nodes
    this.props.expanded.caseOf({
      just: expandedNodes => null,
      nothing: () => this.expandAll(),
    });
  }

  expandAll() {
    const { model, dispatch, context } = this.props;

    const dfsExpand = (c) => {
      const isExpandable = c => c.id !== undefined && c.contentType !== 'Item';

      if (isExpandable(c)) {
        ids.push(c.id);
      }
      if (c.children !== undefined) {
        c.children.toArray().forEach((c) => {
          if (isExpandable(c)) {
            dfsExpand(c);
          }
        });
      }
    };

    const ids = [];
    model.sequences.children.toArray().forEach(dfsExpand);
    dispatch(expandNodes(context.documentId, ids));
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

  toggleExpanded = (id: string) => {
    const { expanded, dispatch, context } = this.props;

    const action = expanded.caseOf({
      just: set => set.has(id) ? collapseNodes : expandNodes,
      nothing: () => expandNodes,
    });

    dispatch(action(context.documentId, [id]));
  }


  componentWillReceiveProps(nextProps: OrgEditorProps) {

    // if (this.props.selectedItem !== nextProps.selectedItem
    //   || this.props.model !== nextProps.model) {
    //   this.findComponentModel(nextProps);
    // }

    if (this.props.placements !== nextProps.placements) {


      // As long as we are still using the same actual document, indentify
      // newly added nodes so that we can highlight them:

      if (this.props.model.guid === nextProps.model.guid) {

        const newNodes = identifyNewNodes(this.props.placements, nextProps.placements);

        if (newNodes.length > 0) {
          if (this.pendingHighlightedNodes === null) {
            this.pendingHighlightedNodes
              = Immutable.Set.of(...newNodes.map(p => p.node.id));
          } else {
            this.pendingHighlightedNodes = this.pendingHighlightedNodes
              .union(Immutable.Set.of(...newNodes.map(p => p.node.id)));
          }

          // As long as the new nodes were not the result of an undo or redo,
          // expand their parent node so that the new nodes are visible
          if (this.props.context.undoRedoGuid === nextProps.context.undoRedoGuid) {
            this.props.dispatch(
              expandNodes(this.props.context.documentId, newNodes
                .filter(p => p.parent.caseOf({ just: n => true, nothing: () => false }))
                .map(p => p.parent.caseOf({ just: n => n.node.id, nothing: () => '' }))));
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

  onSelectComponent(node: NodeTypes) {
    const { context, model, selectedItem } = this.props;

    const x = selectedItem.valueOr({} as any).type === 'OrganizationItem'
      && selectedItem.valueOr({} as any).id;

    console.log('selectedItem', x)
    console.log('selected node', node)

    this.setState({
      selectedNode: Maybe.just(node),
    });

    if (node.contentType === 'Item') {
      viewDocument(node.resourceref.idref,
        context.courseModel.idvers, Maybe.just(model.resource.id));
    } else {
      const id = selectedItem.caseOf({
        just: (item) => {
          if (item.type === 'OrganizationItem') {
            return item.id;
          }
          return null;
        },
        nothing: () => null,
      });

      const componentId = (node as any).id;
      if (componentId !== id) {
        viewDocument(componentId, context.courseModel.idvers, Maybe.just(model.resource.id));
      }
    }
  }

  onNodeEdit(request: org.OrgChangeRequest) {
    this.props.onEdit(request);
  }

  buildCommandButtons(prefix, commands, org, model, labels, processCommand, editMode): Object[] {
    return commands[model.contentType].map(commandClass => new commandClass())
      .map(command => [<button
        className="dropdown-item" key={prefix + command.description(labels)}
        disabled={!command.precondition(org, model) || !editMode}
        onClick={() => processCommand(command)}>{command.description(labels)}</button>])
      .reduce((p, c) => p.concat(c), []);
  }

  renderInsertExisting(org, model, processor) {
    if (commands.ADD_EXISTING_COMMANDS[model.contentType].length > 0) {
      return [
        <h6 className="dropdown-header" key="add-existing">Add existing</h6>,
        ...this.buildCommandButtons(
          'addexisting',
          commands.ADD_EXISTING_COMMANDS,
          org, model, org.labels,
          processor, this.props.editMode),
      ];
    }

    return [];
  }

  renderInsertNew(org: OrganizationModel, model, processor) {
    if (commands.ADD_NEW_COMMANDS[model.contentType].length > 0) {
      return [
        <h6 className="dropdown-header" key="add-new">Add new</h6>,
        ...this.buildCommandButtons(
          'addnew',
          commands.ADD_NEW_COMMANDS,
          org, model, org.labels,
          processor, this.props.editMode)];
    }

    return [];
  }

  processCommand(org, model, command: Command) {
    command.execute(
      org, model, this.props.context.courseModel,
      this.props.displayModal, this.props.dismissModal, this.props.onDispatch)
      .then((cr) => {
        this.props.onEdit(cr);
      });
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
        const res = this.props.context.courseModel.resourcesById.get(node.resourceref.idref);
        isSelected = res !== undefined ? res.id === id : false;
      } else {
        isSelected = node.id === id;
      }

      return (
        <TreeNode
          isSelected={isSelected}
          key={node.guid}
          onClick={this.onSelectComponent}
          onExpand={this.toggleExpanded}
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
          depth={depth}
          onDispatch={this.props.dispatch}
          displayModal={this.props.displayModal}
          dismissModal={this.props.dismissModal}
        />
      );
    };

    return (
      <React.Fragment>
        <table className="table table-sm">
          <tbody>
            {render(
              this.props.model.sequences,
              isExpanded, renderNode, this.props.placements)}
          </tbody>
        </table>
      </React.Fragment>
    );
  }

  renderAddButtonDisabled() {
    return (
      <div className="add-button-container disabled">
        <Tooltip
          html={<span>Select an outline item<br />to add course content</span>} position="top"
          distance={5}>
          <div className="add-button disabled">+</div>
        </Tooltip>
      </div>
    );
  }

  renderAddButtonWithActions(node: NodeTypes) {
    // If selected item is a group, call add new item with selected item as parent
    // If selected item is not a group, it's a resource. call action with item's parent

    const { model } = this.props;

    const parent = org.findContainerOrParent(model, Maybe.just(node.id));
    const processor = this.processCommand.bind(this, model, parent);

    return (
      <div className="add-button-container">
        <div className="dropdown show">
          <div data-toggle="dropdown" data-boundary="window" className="add-button">+</div>
          <div className="dropdown-menu dropdown-menu-right">
            {this.renderInsertNew(model, parent, processor)}
            {/* <h6 className="dropdown-header">Add new</h6>
            <button className="dropdown-item">Group</button>
            <button className="dropdown-item">Page</button>
            <button className="dropdown-item">Assessment</button> */}
            <div className="dropdown-divider" />
            {this.renderInsertExisting(model, parent, processor)}
            {/* <h6 className="dropdown-header">Add existing</h6>
            <button className="dropdown-item">Page</button>
            <button className="dropdown-item">Assessment</button> */}
          </div>
        </div>
      </div>
    );
  }

  renderAddButton() {
    const { selectedNode } = this.state;

    return selectedNode.caseOf({
      just: node => this.renderAddButtonWithActions(node),
      nothing: () => this.renderAddButtonDisabled(),
    });
  }

  render() {
    return (
      <div className="org-editor">
        {this.renderContent()}
        {this.renderAddButton()}
      </div>
    );
  }

}

export default OrgEditor;
