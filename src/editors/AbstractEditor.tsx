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
  document: persistence.Document; 
  userId: string;
  debug: boolean;
}

export interface AbstractEditorState {
  document: persistence.Document;
  lockedOut: boolean;
}

export abstract class AbstractEditor<T extends PersistenceStrategy, P extends AbstractEditorProps, S extends AbstractEditorState>
  extends React.Component<P, S> {

  constructor(props, ctor: NoParamConstructor<T>) {
    super(props);

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

  onContentChange(content: Object) {
    const doc: persistence.Document = this.toFullDocument(content);
    this.persistenceStrategy.triggerChange(doc, 'Saving ' + doc.metadata.type);
  }

  abstract translateContent(content: Object) : Object;

  componentDidMount() {

    this.documentMetadata = this.props.document.metadata;
    this.currentRevision = this.props.document._rev;

    if (this.documentMetadata.lockedBy !== (this.props.userId as string)
      && this.documentMetadata.lockedBy !== '') {
      this.setState({lockedOut: true});
    }
  }

  componentWillUnmount() {
    this.persistenceStrategy.flushPendingChanges();
  }

}

