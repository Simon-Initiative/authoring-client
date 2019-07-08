import * as Immutable from 'immutable';
import * as contentTypes from 'data/contentTypes';
import { Document } from 'data/persistence';
import { ContentModel } from 'data/models';
import { PersistenceStrategy } from 'editors/manager/persistence/PersistenceStrategy';
import { Maybe } from 'tsmonad';
import createGuid from 'utils/guid';
import { DocumentId, ResourceId } from 'data/types';

export type EditedDocumentParams = {
  documentId?: DocumentId,
  document?: Document;
  hasFailed?: boolean;
  error?: string;
  persistence?: PersistenceStrategy;
  activeContentGuid?: Maybe<string>;
  undoStack?: Immutable.Stack<ContentModel>;
  redoStack?: Immutable.Stack<ContentModel>;
  undoRedoGuid?: string;
  editingAllowed?: boolean;
  currentPage?: Maybe<string>;
  currentNode?: Maybe<contentTypes.Node>;
  isSaving?: boolean;
  lastRequestSucceeded?: Maybe<boolean>;
  saveCount?: number;
};

const defaultContent = {
  documentId: ResourceId.of(''),
  document: null,
  hasFailed: false,
  persistence: null,
  error: null,
  activeContentGuid: Maybe.nothing(),
  undoStack: Immutable.Stack<ContentModel>(),
  redoStack: Immutable.Stack<ContentModel>(),
  undoRedoGuid: createGuid(),
  editingAllowed: false,
  currentPage: Maybe.nothing<string>(),
  currentNode: Maybe.nothing<contentTypes.Node>(),
  isSaving: false,
  lastRequestSucceeded: Maybe.nothing(),
  saveCount: 0,
};

export class EditedDocument extends Immutable.Record(defaultContent) {

  documentId: DocumentId;
  document: Document;
  hasFailed: boolean;
  error: string;
  persistence: PersistenceStrategy;
  activeContentGuid: Maybe<string>;
  undoStack: Immutable.Stack<ContentModel>;
  redoStack: Immutable.Stack<ContentModel>;
  undoRedoGuid: string;
  editingAllowed: boolean;
  currentPage: Maybe<string>;
  currentNode: Maybe<contentTypes.Node>;
  isSaving: boolean;
  lastRequestSucceeded: Maybe<boolean>;
  saveCount: number;

  constructor(params?: EditedDocumentParams) {
    super(params);
  }

  with(values: EditedDocumentParams) {
    return this.merge(values) as this;
  }

}
