import { List, Map } from 'immutable';
import { Dispatch } from 'react-redux';
import { State } from 'reducers';
import { Maybe } from 'tsmonad';
import { Document } from 'data/persistence';
import { ContentModel } from 'data/models';
import { EditedDocument } from 'types/document';

export type DOCUMENT_LOADED = 'document/DOCUMENT_LOADED';
export const DOCUMENT_LOADED: DOCUMENT_LOADED = 'document/DOCUMENT_LOADED';

export type DocumentLoadedAction = {
  type: DOCUMENT_LOADED,
  document: Document,
};

export const documentLoaded = (document: Document): DocumentLoadedAction => ({
  type: DOCUMENT_LOADED,
  document,
});



export function save(documentId: string, model: ContentModel) {
  return function (dispatch, getState) {


  };
}

export function undo(documentId: string) {
  return function (dispatch, getState) {


  };
}


export function redo(documentId: string) {
  return function (dispatch, getState) {


  };
}



