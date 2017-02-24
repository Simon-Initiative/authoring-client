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

    console.log('invoke listening');

    persistence.listenToDocument(this.props.document._id)
      .then(doc => {
        console.log('listen complete');
        if (!this.stopListening) {
          console.log('still listening');
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

  abstract saveCompleted(doc: persistence.Document);

  abstract documentChanged(doc: persistence.Document);

  abstract editingAllowed(allowed: boolean);

  stopListeningToChanges() {
    this.stopListening = true;
  }

  componentWillUnmount() {
    this.stopListeningToChanges();    
    this.persistenceStrategy.destroy();
  }

}

