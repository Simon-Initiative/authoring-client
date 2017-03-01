'use strict'

import * as React from 'react';
import { ContentState, EditorState } from 'draft-js';
import { bindActionCreators } from 'redux';

import Toolbar from './Toolbar';
import DraftWrapper from '../../content/common/draft/DraftWrapper';
import {AbstractEditor, AbstractEditorProps, AbstractEditorState} from '../common/AbstractEditor';
import {DeferredPersistenceStrategy} from '../common/persistence/DeferredPersistenceStrategy';
import { translateDraftToContent } from '../../content/common/draft/translate';
import * as persistence from '../../../data/persistence';

interface WorkbookPageEditor {
  authoringActions: any;
  modalActions: any;
  editDispatch: any;
  lastUndoStackSize: number;
  editorState: EditorState;
}

export interface WorkbookPageEditorProps extends AbstractEditorProps {
  
}

interface WorkbookPageEditorState extends AbstractEditorState {
  editHistory: Object[];
}

class WorkbookPageEditor extends AbstractEditor<
  WorkbookPageEditorProps, 
  WorkbookPageEditorState>  {

  constructor(props) {
    super(props, new DeferredPersistenceStrategy());
    
    this.editDispatch = this._editDispatch.bind(this);
    this.lastUndoStackSize = 0;
    this.editorState = null;
    
    this.state = { 
      currentDocument: this.props.document,
      editHistory: []
    };
  }

  editingAllowed(allowed: boolean) {
    super.editingAllowed(allowed);
    if (!allowed) {
      this.listenForChanges();
    }
  }

  saveContent(editorState: EditorState) {

    this.editorState = editorState;

    this.lastUndoStackSize = editorState.getUndoStack().count();

    let inContentModel : Object = translateDraftToContent(editorState.getCurrentContent());
    let newDoc = persistence.copy(this.lastSavedDocument);
    Object.assign(newDoc, inContentModel);

    this.persistenceStrategy.save(newDoc, () => newDoc);
  } 

  _editDispatch(action: Object) {
    this.setState({ editHistory: [action, ...this.state.editHistory]});
  }

  render() {

    const locked = this.state.editingAllowed === null || this.state.editingAllowed === false;
 
    return (
        <div className="container">
            <div className="columns">
                <div className="column col-1"></div>
                <div className="column col-10">
                    <div>
                        <Toolbar
                            dispatch={this.props.dispatch}
                            editDispatch={this.editDispatch} />
                        <DraftWrapper 
                            editHistory={this.state.editHistory} 
                            content={this.state.currentDocument} 
                            locked={locked}
                            notifyOnChange={this.saveContent.bind(this)} />
                    </div>
                </div>
                
                <div className="column col-1"></div>
            </div>
        </div>
    )
  }

}

export default WorkbookPageEditor;
