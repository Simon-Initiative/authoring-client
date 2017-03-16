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

interface EmbeddedEditorManager {

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

  _onMouseEnter: () => void;

  _onMouseLeave: () => void;

}

export interface EmbeddedEditorManagerProps {

  documentId: string;

  userId: string;

  services: AppServices;

  editMode: boolean;

  blockKey?: string;

  onEditModeChange: (blockKey: string, editMode: boolean) => void;

}

export interface EmbeddedEditorManagerState {
  editingAllowed: boolean;
  document: persistence.Document;
  hovering: boolean;
}

class EmbeddedEditorManager extends React.Component<EmbeddedEditorManagerProps, EmbeddedEditorManagerState> {

  constructor(props) {
    super(props);

    this.state = { 
      document: null, 
      editingAllowed: null, 
      hovering: false
    };
    this.componentDidUnmount = false;
    this.persistenceStrategy = null; 
    this._onEdit = this.onEdit.bind(this);
    this._onEditModeChange = this.onEditModeChange.bind(this);

    this._onMouseEnter = this.onMouseEnter.bind(this);
    this._onMouseLeave = this.onMouseLeave.bind(this);

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
    this.props.onEditModeChange(this.props.blockKey, editMode);
  }

  initPersistence(document: persistence.Document) {

    this.persistenceStrategy = lookUpByName(document.model.modelType).persistenceStrategy;
        
    this.persistenceStrategy.initialize(
      document, this.props.userId, 
      this.onSaveCompleted, this.onSaveFailure)
    .then(editingAllowed => {

      if (!this.componentDidUnmount) {
        this.setState({editingAllowed});

        const listeningApproach: ListeningApproach = lookUpByName(document.model.modelType).listeningApproach;
        if ((!editingAllowed && listeningApproach === ListeningApproach.WhenReadOnly) ||
          listeningApproach === ListeningApproach.Always) {

          this.stopListening = false;
          this.listenForChanges();
        }
      }
      

    });
  }

  fetchDocument(documentId: string) {
    persistence.retrieveDocument(documentId)
      .then(document => {
        this.lastSavedDocument = document;

        if (!this.componentDidUnmount) {

          // Tear down previous persistence strategy
          if (this.persistenceStrategy !== null) {
            this.persistenceStrategy.destroy()
              .then(nothing => {
                this.initPersistence(document);
              });
          } else {
            this.initPersistence(document);
          }
          
          this.setState({document});

        }

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

  onMouseEnter() {
    this.setState({hovering: true});
  }

  onMouseLeave() {
    this.setState({hovering: false});
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
        editMode: this.props.editMode,
        onEditModeChange: this._onEditModeChange
      }
      
      const registeredEditor = lookUpByName(this.state.document.model.modelType);
      const editor = React.createElement( (registeredEditor.component as any), childProps);

      const editModeText = this.props.editMode ? 'Done' : 'Edit';

      const highlightStyle = {
        border: this.state.hovering ? "5px solid gray" : "5px solid white"
      };

      if (this.state.editingAllowed) {
        return <div onMouseEnter={this._onMouseEnter} onMouseLeave={this._onMouseLeave} 
            style={highlightStyle}>
          <button onClick={() => this.onEditModeChange(this.props.blockKey, !this.props.editMode)} className="btn btn-sm">{editModeText}</button>
          {editor}
        </div>
      } else {
        return <div onMouseEnter={this._onMouseEnter} onMouseLeave={this._onMouseLeave} 
            style={highlightStyle}>
          {editor}
        </div>
      }

    }
  }
  
}

export default EmbeddedEditorManager;
