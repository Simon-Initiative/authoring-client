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
  currentDocument: persistence.Document;
  persistenceStrategy: T;
  onSaveCompleted: onSaveCompletedCallback;
  onSaveFailure: onFailureCallback;
}

export interface AbstractEditorProps {
  dispatch: any;
  userId: string;
  debug: boolean;
  document: persistence.Document;
}

export interface AbstractEditorState {
  editingAllowed? : boolean;
}

export abstract class AbstractEditor<T extends PersistenceStrategy, P extends AbstractEditorProps, S extends AbstractEditorState>
  extends React.Component<P, S> {

  constructor(props, ctor: NoParamConstructor<T>) {
    super(props);

    this.state = ({ editingAllowed: false } as any);
    this.persistenceStrategy = new ctor();
    this.currentDocument = this.props.document;
    
    this.onSaveCompleted = (doc: persistence.Document) => {
      this.currentDocument = doc;
    };

    this.onSaveFailure = (failure: any) => {

    };

    this.persistenceStrategy.initialize(this.props.document, this.props.userId,
      this.onSaveCompleted, this.onSaveFailure)
      .then(result => this.setState({ editingAllowed: result }))
      .catch(err => console.log(err));
  }

  componentWillUnmount() {
    this.persistenceStrategy.destroy();
  }

}

