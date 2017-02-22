'use strict'

import * as React from 'react';
import { ContentState } from 'draft-js';
import { bindActionCreators } from 'redux';

import Toolbar from './Toolbar';
import DraftWrapper from '../DraftWrapper';
import {AbstractEditor, AbstractEditorProps, AbstractEditorState} from '../AbstractEditor';
import {DeferredPersistenceStrategy} from '../persistence/DeferredPersistenceStrategy';
import { translateDraftToContent } from '../translate';
import * as persistence from '../../data/persistence';

interface WorkbookPageEditor {
  authoringActions: any;
  modalActions: any;
  editDispatch: any;
}

export interface WorkbookPageEditorProps extends AbstractEditorProps {
  
}

interface WorkbookPageEditorState extends AbstractEditorState {
  content: Object;
  editHistory: Object[];
}

class WorkbookPageEditor extends AbstractEditor<DeferredPersistenceStrategy, WorkbookPageEditorProps, WorkbookPageEditorState>  {

  constructor(props) {
    super(props, DeferredPersistenceStrategy);
    
    this.editDispatch = this._editDispatch.bind(this);
    
    this.state = { 
      content: this.props.document.content,
      editHistory: []
    };
  }

  saveContent(content: Object) {
    let inContentModel : Object = translateDraftToContent(content);
    let newDoc = persistence.copy(this.currentDocument);
    newDoc.content = inContentModel;
    this.persistenceStrategy.save(newDoc, () => newDoc);
  } 

  _editDispatch(action: Object) {
    this.setState({ editHistory: [action, ...this.state.editHistory]});
  }

  render() {
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
                            content={this.state.content} 
                            locked={!this.state.editingAllowed}
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
