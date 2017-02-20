'use strict'

import * as React from 'react';
import { ContentState } from 'draft-js';

import { persistence } from '../../actions/persistence';
import Toolbar from './Toolbar';
import DraftWrapper from '../DraftWrapper';
import {AbstractEditor, AbstractEditorProps, AbstractEditorState} from '../AbstractEditor';
import {DeferredPersistenceStrategy} from '../persistence/DeferredPersistenceStrategy';
import { translateDraftToContent } from '../translate';

interface WorkbookPageEditor {
}

export interface WorkbookPageEditorProps extends AbstractEditorProps {
  editHistory: Object[];
  authoringActions: any;
  modalActions: any;
}

interface WorkbookPageEditorState extends AbstractEditorState {
  content: Object;
}

class WorkbookPageEditor extends AbstractEditor<DeferredPersistenceStrategy, WorkbookPageEditorProps, WorkbookPageEditorState>  {

  constructor(props) {
    super(props, DeferredPersistenceStrategy);
    
    this.setState({ content: this.props.document.content });
  }

  translateContent(content: Object) : Object {
    return translateDraftToContent(content);
  } 

  render() {
    return (
        <div className="container">
            <div className="columns">
                <div className="column col-1"></div>
                <div className="column col-10">
                    <div>
                        <Toolbar
                            authoringActions={this.props.authoringActions} 
                            modalActions={this.props.modalActions} />
                        <DraftWrapper 
                            editHistory={this.props.editHistory} 
                            content={this.state.content} 
                            locked={this.state.lockedOut}
                            notifyOnChange={this.onContentChange.bind(this)} />
                    </div>
                </div>
                
                <div className="column col-1"></div>
            </div>
        </div>
    )
  }

}

export default WorkbookPageEditor;


