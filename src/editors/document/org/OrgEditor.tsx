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
import * as persistence from '../../../data/persistence';
import LearningObjectiveLinker from '../../../components/LinkerDialog';
import { SequenceEditor } from '../../content/org/SequenceEditor';

import { insertNode, removeNode } from './utils';

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

  onSequenceEdit(s : contentTypes.Sequence) {

  }

  renderChild(c: contentTypes.Sequence | contentTypes.Include) {
    if (c.contentType === contentTypes.OrganizationContentTypes.Sequence) {
      return <SequenceEditor model={c} onEdit={this.onSequenceEdit} 
        context={this.props.context} labels={this.props.model.labels}
        parentGuid={this.props.model.guid}
        onReposition={this.onReposition.bind(this)}
        services={this.props.services} editMode={this.props.editMode} />;
    } else {
      return 'Include Editor';
    }
  }

  onReposition(sourceNode: Object, targetGuid: string, index: number) {

    const removed = removeNode(this.props.model, (sourceNode as any).guid);
    const inserted = insertNode(removed, targetGuid, sourceNode, index);

    this.handleEdit(inserted);
  }

  render() {

    return (
      <div>
        <div className="docHead">
          <UndoRedoToolbar 
            undoEnabled={this.state.undoStackSize > 0}
            redoEnabled={this.state.redoStackSize > 0}
            onUndo={this.undo.bind(this)} onRedo={this.redo.bind(this)}/>
          
          <div className="container">
            {this.props.model.sequences.children.toArray().map(c => this.renderChild(c))}
          </div>
        </div>
      </div>);
    
  }

}

export default OrgEditor;

