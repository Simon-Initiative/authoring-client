'use strict'

import * as React from 'react';

import * as persistence from '../data/persistence';

import { PersistenceStrategy, 
  onSaveCompletedCallback, 
  onFailureCallback } from './persistence/PersistenceStrategy';

interface NoParamConstructor<T> {
    new (): T;
}

export interface AbstractEditor<T extends PersistenceStrategy, P extends AbstractEditorProps, S extends AbstractEditorState> {
  lastContent: any;
  timer: any;
  timerStart: number;
  persistenceStrategy: T;
  onSaveCompleted: onSaveCompletedCallback;
  onSaveFailure: onFailureCallback;
  stopListening: boolean;
}

export interface AbstractEditorProps {
  dispatch: any;
  userId: string;
  debug: boolean;
  document: persistence.Document;
}

export interface AbstractEditorState {
  editingAllowed? : boolean;
  currentDocument: persistence.Document;
}

/**
 * An abstract editor that provides the basis for reusable 
 * persistence and undo/redo. 
 */
export abstract class AbstractEditor<T extends PersistenceStrategy, P extends AbstractEditorProps, S extends AbstractEditorState>
  extends React.Component<P, S> {

  constructor(props, ctor: NoParamConstructor<T>) {
    super(props);

    this.state = ({ 
      editingAllowed: null,
      currentDocument: this.props.document
    } as any);

    this.stopListening = false;
    this.persistenceStrategy = new ctor();
    
    this.onSaveCompleted = (doc: persistence.Document) => {
      this.saveCompleted(doc);
    };

    this.onSaveFailure = (failure: any) => {

    };

    this.persistenceStrategy.initialize(this.props.document, this.props.userId,
      this.onSaveCompleted, this.onSaveFailure)
      .then(result => {
        this.editingAllowed(result);
        this.setState({ editingAllowed: result })
      })
      .catch(err => console.log(err));
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
   * as the basis for future save requests. 
   */
  abstract saveCompleted(doc: persistence.Document);

  /**
   * Lifecycle method that fires when a document that is not being
   * edited by the user changes based on edits being made by another
   * user. 
   */
  abstract documentChanged(doc: persistence.Document);

  /**
   * Lifecycle method that fires after the persistence strategy
   * finishes initialization and determines whether or not editing 
   * is allowed by the current user. 
   */
  abstract editingAllowed(allowed: boolean);

  stopListeningToChanges() {
    this.stopListening = true;
  }

  componentWillUnmount() {
    this.stopListeningToChanges();    
    this.persistenceStrategy.destroy();
  }

}

