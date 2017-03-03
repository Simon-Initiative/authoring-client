'use strict'

import * as React from 'react';
import { bindActionCreators } from 'redux';

import * as persistence from '../../data/persistence';
import * as models from '../../data/models';
import { document as documentActions } from '../../actions/document';
import { AbstractEditorProps, EditorServices } from '../document/common/AbstractEditor';
import { PersistenceStrategy, 
  onSaveCompletedCallback, 
  onFailureCallback } from './persistence/PersistenceStrategy';
import { ListeningApproach } from './ListeningApproach';
import { lookUpByName } from './registry';

interface EditorManager {

  serviceProvider: EditorServices;

  persistenceStrategy: PersistenceStrategy;

  onSaveCompleted: onSaveCompletedCallback;

  onSaveFailure: onFailureCallback;

  stopListening: boolean;

  // The most recently saved document during the display of the child editor. This
  // must be the document that is used as the bases for future changes. 
  lastSavedDocument: persistence.Document;

  _onEdit: (c : models.ChangeRequest) => void;
}

export interface EditorManagerProps {
  documentId: string;
  userId: string;
  dispatch: any;
}

export interface EditorManagerState {
  editingAllowed: boolean;
  document: persistence.Document;
}

class EditorManager extends React.Component<EditorManagerProps, EditorManagerState> {

  constructor(props) {
    super(props);

    this.state = { document: null, editingAllowed: null};

    this.serviceProvider = {
      viewDocument: (id) => this.props.dispatch(documentActions.viewDocument(id))
    };

    this.persistenceStrategy = null; 
    this._onEdit = this.onEdit.bind(this);

    this.onSaveCompleted = (doc: persistence.Document) => {
      this.lastSavedDocument = doc;
      this.setState({ document: doc});
    };

    this.onSaveFailure = (reason : any) => {

    }
  }

  onEdit(changeRequest : models.ChangeRequest) {
    this.persistenceStrategy.save(this.lastSavedDocument, changeRequest);
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
        console.log('start listening');
        this.listenForChanges();
      }

    });
  }

  fetchDocument(documentId: string) {
    persistence.retrieveDocument(documentId)
      .then(document => {
        console.log('retrieved document');
        this.lastSavedDocument = document;

        // Tear down previous persistence strategy
        if (this.persistenceStrategy !== null) {
          this.persistenceStrategy.destroy()
            .then(nothing => this.initPersistence(document));
        } else {
          this.initPersistence(document);
        }
        
        this.setState({document})

      })
      .catch(err => console.log(err));
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.documentId !== nextProps.documentId) {
      console.log('received new document id');
      this.stopListening = true;
      this.fetchDocument(nextProps.documentId);
    }
  }

  componentDidMount() {
    this.fetchDocument(this.props.documentId);
  }  

  componentWillUnmount() {
    this.stopListening = true;
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
    if (this.state.document === null) {
      return null;
    } else {
      console.log("rendered EditorManager");
      const childProps : AbstractEditorProps<any> = {
        model : this.state.document.model,
        onEdit: this._onEdit,
        userId: this.props.userId,
        editingAllowed: this.state.editingAllowed,
        services: this.serviceProvider
      }
      
      let component = lookUpByName(this.state.document.model.modelType).component;
      return React.createElement( (component as any), childProps);
    }
  }
  
}

export default EditorManager;
