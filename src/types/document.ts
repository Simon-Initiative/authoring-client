import * as Immutable from 'immutable';
import * as contentTypes from 'data/contentTypes';
import { Document } from 'data/persistence';
import { ContentModel } from 'data/models';
import { PersistenceStrategy } from 'editors/manager/persistence/PersistenceStrategy';
import { Maybe } from 'tsmonad';
import createGuid from 'utils/guid';


export type EditedDocumentParams = {
  documentId? : string,
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
};

const defaultContent = {
  documentId: '',
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
};

export class EditedDocument extends Immutable.Record(defaultContent) {

  documentId: string;
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

  constructor(params?: EditedDocumentParams) {
    super(params);
  }

  with(values: EditedDocumentParams) {
    return this.merge(values) as this;
  }

}
