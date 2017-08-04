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
import { SequenceEditor } from '../../content/org/SequenceEditor';
import { render } from './traversal';
import { collapseNodes, expandNodes } from '../../../actions/expand';
import { renderDraggableTreeNode, 
  canAcceptDrop, SourceNodeType } from '../../content/org/drag/utils';
import { insertNode, removeNode } from './utils';
import { TreeNode } from './TreeNode';
import { ActionDropdown } from './ActionDropdown';
import { Row } from './Row';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

interface OrgEditor {
  
}

export interface OrgEditorProps extends AbstractEditorProps<models.OrganizationModel> {
  
}

interface OrgEditorState extends AbstractEditorState {
  
}


@DragDropContext(HTML5Backend)
class OrgEditor extends AbstractEditor<models.OrganizationModel,
  OrgEditorProps, 
  OrgEditorState>  {

  constructor(props) {
    super(props, ({} as OrgEditorState));
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

  render() {

    const isExpanded = 
      guid => this.props.expanded.has(guid);

    const renderNode = (node, parent, index, depth) => {
      return <TreeNode 
        model={node} 
        parentModel={parent} 
        editMode={this.props.editMode}
        toggleExpanded={this.toggleExpanded.bind(this)} 
        isExpanded={isExpanded(node.guid)}
        onReposition={this.onReposition.bind(this)}
        indexWithinParent={index} 
        context={this.props.context} 
        depth={depth}/>;
    };
    const wrapper = (model, element, i) => {
      return (
        <Row model={model} key={model.guid} isExpanded={isExpanded(model.guid)}
          index={i} processCommand={this.processCommand.bind(this, model)}>
          {element}
        </Row>
      );
    };

    return (
      <div>
        <div className="docHead">
          <UndoRedoToolbar 
            undoEnabled={this.state.undoStackSize > 0}
            redoEnabled={this.state.redoStackSize > 0}
            onUndo={this.undo.bind(this)} onRedo={this.redo.bind(this)}/>
         
          <table className="table table-sm table-striped">
            <thead>
            <tr key="header">
              <th key="comp">Component</th>
              <th key="action">Actions</th>
            </tr>
          </thead>
          <tbody>

            {render(
              this.props.model.sequences, 
              isExpanded,renderNode, wrapper)}
  
          </tbody>
          </table>

        </div>
      </div>);
    
  }

}

export default OrgEditor;

