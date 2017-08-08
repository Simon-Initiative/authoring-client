import * as React from 'react';
import * as Immutable from 'immutable';

import { AbstractEditor, AbstractEditorProps, AbstractEditorState } from '../common/AbstractEditor';
import { HtmlContentEditor } from '../../content/html/HtmlContentEditor';
import { TitleContentEditor } from '../../content/title/TitleContentEditor';
import { QuestionEditor } from '../../content/question/QuestionEditor';
import { ContentEditor } from '../../content/content/ContentEditor';
import { SelectionEditor } from '../../content/selection/SelectionEditor';
import { UnsupportedEditor } from '../../content/unsupported/UnsupportedEditor';
import { Select } from '../../content/common/Select';
import { TextInput } from '../../content/common/TextInput';
import { Linkable } from '../../../data/content/linkable';
import * as models from '../../../data/models';
import { Resource } from '../../../data/content/resource';
import { UndoRedoToolbar } from '../common/UndoRedoToolbar';
import * as contentTypes from '../../../data/contentTypes';
import { LegacyTypes } from '../../../data/types';
import guid from '../../../utils/guid';
import { Command } from './commands/command';
import * as persistence from '../../../data/persistence';
import LearningObjectiveLinker from '../../../components/LinkerDialog';
import { render, getExpandId } from './traversal';
import { collapseNodes, expandNodes } from '../../../actions/expand';
import { renderDraggableTreeNode, 
  canAcceptDrop, SourceNodeType } from '../../content/org/drag/utils';
import { insertNode, removeNode, updateNode } from './utils';
import { TreeNode } from './TreeNode';
import { ActionDropdown } from './ActionDropdown';
import { Row } from './Row';
import { Details } from './Details';
import { LabelsEditor } from '../../content/org/LabelsEditor';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

interface OrgEditor {
  
}

export interface OrgEditorProps extends AbstractEditorProps<models.OrganizationModel> {
  
}

const enum TABS {
  Content = 0,
  Details = 1,
  Labels = 2,
}

interface OrgEditorState extends AbstractEditorState {
  currentTab: TABS;
}


@DragDropContext(HTML5Backend)
class OrgEditor extends AbstractEditor<models.OrganizationModel,
  OrgEditorProps, 
  OrgEditorState>  {

  constructor(props) {
    super(props, ({ currentTab: TABS.Content } as OrgEditorState));

    this.onLabelsEdit = this.onLabelsEdit.bind(this);
    this.onNodeEdit = this.onNodeEdit.bind(this);
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

    this.handleEdit(inserted);
  }

  toggleExpanded(guid) {
    const action = this.props.expanded.has(guid) ? collapseNodes : expandNodes;
    this.props.dispatch(action(this.props.context.documentId, [guid]));
  }

  processCommand(model, command: Command) {

    const delay = () => 
      command.execute(this.props.model, model, this.props.context, this.props.services)
        .then(org => this.handleEdit(org));

    setTimeout(delay, 0);    
  }

  onNodeEdit(node) {
    this.handleEdit(updateNode(this.props.model, node));
  }

  renderContent() {

    const isExpanded = 
      guid => this.props.expanded.has(guid);

    const renderNode = (node, parent, index, depth) => {
      return <TreeNode 
        labels={this.props.model.labels}
        model={node} 
        parentModel={parent} 
        onEdit={this.onNodeEdit}
        editMode={this.props.editMode}
        processCommand={this.processCommand.bind(this, node)}
        toggleExpanded={this.toggleExpanded.bind(this)} 
        isExpanded={isExpanded(getExpandId(node))}
        onReposition={this.onReposition.bind(this)}
        indexWithinParent={index} 
        context={this.props.context} 
        depth={depth}/>;
    };
    const wrapper = (model, element, i) => {
      return (
        <Row model={model} labels={this.props.model.labels} 
          key={model.guid} isExpanded={isExpanded(getExpandId(model))}
          index={i} processCommand={this.processCommand.bind(this, model)}>
          {element}
        </Row>
      );
    };

    return (
      <table className="table table-sm table-striped">
      <tbody>

        {render(
          this.props.model.sequences, 
          isExpanded,renderNode, wrapper)}

      </tbody>
      </table>
    );
  }

  renderDetails() {
    return <Details editMode={this.props.editMode} 
      model={this.props.model} onEdit={model => this.handleEdit(model)}/>;
  }

  onLabelsEdit(labels) {
    this.handleEdit(this.props.model.with({ labels }));
  }

  renderLabels() {
    return <LabelsEditor {...this.props} 
      onEdit={this.onLabelsEdit} model={this.props.model.labels} />;
  }

  renderConstraints() {
    return <p>TBD Constraint Editor</p>;
  }

  onTabClick(index: number) {
    this.setState({ currentTab: index });
  }

  renderTabs() {

    const tabs = ['Content', 'Details', 'Labels']
      .map((title, index) => {
        const active = index === this.state.currentTab ? 'active' : '';
        const classes = 'nav-link ' + active;
        return <a className={classes} onClick={this.onTabClick.bind(this, index)}>{title}</a>;
      });

    return (
      <ul className="nav nav-tabs">
        {tabs}
      </ul>
    );
  }

  renderActiveTabContent() {
    switch (this.state.currentTab) {
      case TABS.Content:
        return this.renderContent();
      case TABS.Details:
        return this.renderDetails();
      case TABS.Labels:
        return this.renderLabels();
    }
  }

  render() {

    return (
      <div>
        <div className="docHead">
          <UndoRedoToolbar 
            undoEnabled={this.state.undoStackSize > 0}
            redoEnabled={this.state.redoStackSize > 0}
            onUndo={this.undo.bind(this)} onRedo={this.redo.bind(this)}/>

          <h3>Organization: {this.props.model.title}</h3>
         
          {this.renderTabs()}

          <div style={ { marginTop: '30px' } }>
            {this.renderActiveTabContent()}
          </div>

        </div>
      </div>);
    
  }

}

export default OrgEditor;

