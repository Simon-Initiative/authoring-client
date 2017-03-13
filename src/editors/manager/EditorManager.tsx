import * as React from 'react';
import { bindActionCreators } from 'redux';

import * as persistence from '../../data/persistence';
import * as models from '../../data/models';
import { document as documentActions } from '../../actions/document';
import { AbstractEditorProps } from '../document/common/AbstractEditor';
import { AppServices } from '../common/AppServices';
import { PersistenceStrategy, 
  onSaveCompletedCallback, 
  onFailureCallback } from './persistence/PersistenceStrategy';
import { ListeningApproach } from './ListeningApproach';
import { lookUpByName } from './registry';

interface EditorManager {

  componentDidUnmount: boolean;

  persistenceStrategy: PersistenceStrategy;

  onSaveCompleted: onSaveCompletedCallback;

  onSaveFailure: onFailureCallback;

  stopListening: boolean;

  // The most recently saved document during the display of the child editor. This
  // must be the document that is used as the bases for future changes. 
  lastSavedDocument: persistence.Document;

  _onEdit: (c : models.ChangeRequest) => void;

  _onEditModeChange: (blockKey: string, mode: boolean) => void;

}

export interface EditorManagerProps {

  documentId: string;

  userId: string;

  services: AppServices;

  editMode: boolean;

  blockKey?: string;
}

export interface EditorManagerState {
  editingAllowed: boolean;
  document: persistence.Document;
  editMode: boolean;
  blockKey: string;
}

class EditorManager extends React.Component<EditorManagerProps, EditorManagerState> {

  constructor(props) {
    super(props);

    this.state = { 
      document: null, 
      editingAllowed: null, 
      editMode: this.props.editMode,
      blockKey: null
    };
    this.componentDidUnmount = false;
    this.persistenceStrategy = null; 
    this._onEdit = this.onEdit.bind(this);
    this._onEditModeChange = this.onEditModeChange.bind(this);

    this.onSaveCompleted = (doc: persistence.Document) => {
      this.lastSavedDocument = doc;
      if (!this.componentDidUnmount) {
        this.setState({ document: doc});
      }
      
    };

    this.onSaveFailure = (reason : any) => {

    }
  }

  onEdit(changeRequest : models.ChangeRequest) {
    this.persistenceStrategy.save(this.lastSavedDocument, changeRequest);
  }

  onEditModeChange(blockKey: string, editMode: boolean) {
    this.setState({blockKey, editMode});
  }

  initPersistence(document: persistence.Document) {

    this.persistenceStrategy = lookUpByName(document.model.modelType).persistenceStrategy;
        
    this.persistenceStrategy.initialize(
      document, this.props.userId, 
      this.onSaveCompleted, this.onSaveFailure)
    .then(editingAllowed => {

      this.setState({editingAllowed});

      const listeningApproach: ListeningApproach = lookUpByName(document.model.modelType).listeningApproach;
      if ((!editingAllowed && listeningApproach === ListeningApproach.WhenReadOnly) ||
        listeningApproach === ListeningApproach.Always) {

        this.stopListening = false;
        this.listenForChanges();
      }

    });
  }

  fetchDocument(documentId: string) {
    persistence.retrieveDocument(documentId)
      .then(document => {
        this.lastSavedDocument = document;

        // Tear down previous persistence strategy
        if (this.persistenceStrategy !== null) {
          this.persistenceStrategy.destroy()
            .then(nothing => {
              this.initPersistence(document) 
            });
        } else {
          this.initPersistence(document);
        }
        
        this.setState({document})

      })
      .catch(err => console.log(err));
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.documentId !== nextProps.documentId) {
      this.stopListening = true;
      this.setState({document: null, editingAllowed: null});
      this.fetchDocument(nextProps.documentId);
    }
  }

  componentDidMount() {
    this.fetchDocument(this.props.documentId);
  }  

  componentWillUnmount() {
    this.stopListening = true;
    this.componentDidUnmount = true;
    if (this.persistenceStrategy !== null) {
      this.persistenceStrategy.destroy();
    }
  }

  listenForChanges() {
    persistence.listenToDocument(this.props.documentId)
      .then(document => {
        if (!this.stopListening) {
          
          this.setState({document});

          this.listenForChanges();
        }

      })
      .catch(err => {
        if (!this.stopListening) {
          this.listenForChanges();
        }
      })
  }

  render() : JSX.Element {
    if (this.state.document === null || this.state.editingAllowed === null) {
      return null;
    } else {
      const childProps : AbstractEditorProps<any> = {
        model : this.state.document.model,
        documentId: this.props.documentId,
        onEdit: this._onEdit,
        userId: this.props.userId,
        editingAllowed: this.state.editingAllowed,
        services: this.props.services,
        editMode: this.state.editMode,
        onEditModeChange: this._onEditModeChange
      }
      
      const registeredEditor = lookUpByName(this.state.document.model.modelType);
      const editor = React.createElement( (registeredEditor.component as any), childProps);

      const editModeText = this.state.editMode ? 'Done' : 'Edit';

      if (registeredEditor.protected && this.state.editingAllowed) {
        return <div>
          <button onClick={() => this.onEditModeChange(this.props.blockKey, !this.state.editMode)} className="btn btn-sm">{editModeText}</button>
          {editor}
        </div>
      } else {
        return <div>
          {editor}
        </div>
      }

    }
  }
  
}

export default EditorManager;
