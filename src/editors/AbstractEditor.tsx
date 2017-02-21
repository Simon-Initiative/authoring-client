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
  currentRevision: string;
  documentMetadata: persistence.DocumentMetadata;
  persistenceStrategy: T;
  onSaveCompleted: onSaveCompletedCallback;
  onSaveFailure: onFailureCallback;
}

export interface AbstractEditorProps {
  dispatch: any;
  document: persistence.Document; 
  userId: string;
  debug: boolean;
}

export interface AbstractEditorState {
  editingAllowed: boolean;
}

export abstract class AbstractEditor<T extends PersistenceStrategy, P extends AbstractEditorProps, S extends AbstractEditorState>
  extends React.Component<P, S> {

  constructor(props, ctor: NoParamConstructor<T>) {
    super(props);

    this.state = ({ editingAllowed: false } as any);
    this.persistenceStrategy = new ctor();
    this.currentRevision = null;
    this.documentMetadata = null;

    this.onSaveCompleted = (result: persistence.PersistSuccess) => {
      this.currentRevision = result.rev;
    };

    this.onSaveFailure = (failure: any) => {

    };
  }

  toFullDocument(content: Object) : persistence.Document {
    return { 
      _rev: this.currentRevision, 
      _id: this.props.document._id, 
      content,
      metadata: this.documentMetadata
    };
  }

  /**
   * Called to trigger a save of the document. 
   */
  onContentChange(content: Object) {
    const doc: persistence.Document = this.toFullDocument(content);
    this.persistenceStrategy.save(doc, () => doc);
  }

  componentDidMount() {
    this.documentMetadata = this.props.document.metadata;
    this.currentRevision = this.props.document._rev;

    this.persistenceStrategy.initialize(this.props.document, this.props.userId)
      .then(result => this.setState({ editingAllowed: result }))
      .catch(err => console.log(err));
  }

  componentWillUnmount() {
    this.persistenceStrategy.destroy();
  }

}

