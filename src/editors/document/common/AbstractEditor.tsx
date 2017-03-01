'use strict'

import * as React from 'react';

import * as persistence from '../../../data/persistence';
import * as content from '../../../data/content';

import { PersistenceStrategy, 
  onSaveCompletedCallback, 
  onFailureCallback } from './persistence/PersistenceStrategy';

export interface AbstractEditor<P extends AbstractEditorProps, S extends AbstractEditorState> {
  persistenceStrategy: PersistenceStrategy;
  onSaveCompleted: onSaveCompletedCallback;
  onSaveFailure: onFailureCallback;
  stopListening: boolean;

  // The most recently saved document during the use of this editor. This
  // must be the document that is used as the bases for future changes. 
  lastSavedDocument: persistence.Document;
}

export interface AbstractEditorProps {

  // The dispatch function 
  dispatch: any;

  // Id of the current user
  userId: string;

  // Debug mode 
  debug: boolean;

  // The initial document passed into the editor.
  document: persistence.Document;

  
}

export interface AbstractEditorState {

  // Whether or not editing is allowed for this user for this document
  // Will be null initally, and will then be set to true or false after
  // the persistence strategy initializes. 
  editingAllowed? : boolean;

  // The current document that the editor should be rendering. This can
  // be different that the lastSavedDocument, depdending on the implementation
  // of the persistence strategy being used. 
  currentDocument?: persistence.Document;

  
}

/**
 * An abstract editor that provides the basis for reusable 
 * persistence and undo/redo. 
 */
export abstract class AbstractEditor<P extends AbstractEditorProps, S extends AbstractEditorState>
  extends React.Component<P, S> {

  constructor(props, persistenceStrategy : PersistenceStrategy) {
    super(props);

    this.persistenceStrategy = persistenceStrategy;

    this.onSaveCompleted = (doc: persistence.Document) => {
      this.saveCompleted(doc);
    };

    this.onSaveFailure = (failure: any) => {

    };

    this.lastSavedDocument = this.props.document;

    this.state = { 
      editingAllowed: null,
      currentDocument: this.props.document
    } as any;

    this.stopListening = false;
    
    this.persistenceStrategy.initialize(this.props.document, this.props.userId,
      this.onSaveCompleted, this.onSaveFailure)
      .then(result => {
        this.editingAllowed(result);
      })
      .catch(err => console.log(err));
  }

  componentWillReceiveProps(nextProps: AbstractEditorProps) {
    if (nextProps.document._rev !== this.props.document._rev) {
      this.setState({ 
        editingAllowed: null,
        currentDocument: this.props.document,
        lastSavedDocument: this.props.document
      } as any);

      this.stopListening = false;
      
      this.persistenceStrategy.initialize(this.props.document, this.props.userId,
        this.onSaveCompleted, this.onSaveFailure)
        .then(result => {
          this.editingAllowed(result);
        })
        .catch(err => console.log(err));
    }
  }

  listenForChanges() {
    persistence.listenToDocument(this.props.document._id)
      .then(doc => {
        if (!this.stopListening) {
          this.documentChanged(doc);
          this.listenForChanges();
        }

      })
      .catch(err => {
        if (!this.stopListening) {
          this.listenForChanges();
        }
      })
  }

  /**
   * Lifecycle method that fires when a save is successfully completed 
   * by the persistence strategy. The document here will contain 
   * the revision that was persisted.  This document should be used
   * as the basis for future save requests. That document will also
   * be present in the state as lastSavedDocument. 
   */
  saveCompleted(doc: persistence.Document) {
    this.lastSavedDocument = doc;
  }

  /**
   * Lifecycle method that fires when a document that is not being
   * edited by the user changes based on edits being made by another
   * user. 
   */
  documentChanged(doc: persistence.Document) {
    this.lastSavedDocument = doc;
    this.setState({ 
      currentDocument: doc
    } as any);
  }

  /**
   * Lifecycle method that fires after the persistence strategy
   * finishes initialization and determines whether or not editing 
   * is allowed by the current user. 
   */
  editingAllowed(editingAllowed: boolean) {
    this.setState({ editingAllowed });
  }

  stopListeningToChanges() {
    this.stopListening = true;
  }

  componentWillUnmount() {
    this.stopListeningToChanges();    
    this.persistenceStrategy.destroy();
  }

}

