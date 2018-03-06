import * as Immutable from 'immutable';
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

  constructor(params?: EditedDocumentParams) {
    super(params);
  }

  with(values: EditedDocumentParams) {
    return this.merge(values) as this;
  }

}
