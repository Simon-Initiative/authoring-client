import * as Immutable from 'immutable';
import * as persistence from 'data/persistence';
import { Dispatch } from 'react-redux';
import { State } from 'reducers';
import { ParentContainer } from 'types/active';

export type UPDATE_CONTENT = 'active/UPDATE_CONTENT';
export const UPDATE_CONTENT: UPDATE_CONTENT = 'active/UPDATE_CONTENT';

export type UpdateContentAction = {
  type: UPDATE_CONTENT,
  documentId: string,
  content: Object,
};

export const updateContent = (
  documentId: string, content: Object): UpdateContentAction => ({
    type: UPDATE_CONTENT,
    documentId,
    content,
  });


export type UPDATE_CONTEXT = 'active/UPDATE_CONTEXT';
export const UPDATE_CONTEXT: UPDATE_CONTEXT = 'active/UPDATE_CONTEXT';

export type UpdateContextAction = {
  type: UPDATE_CONTEXT,
  documentId: string,
  content: Object,
  container: ParentContainer,
};

export const updateContext = (
  documentId: string, content: Object, container: ParentContainer): UpdateContextAction => ({
    type: UPDATE_CONTEXT,
    documentId,
    content,
    container,
  });


export function insert(content: Object) {
  return function (dispatch, getState) {


  };
}

export function edit(content: Object) {
  return function (dispatch, getState) {


  };
}

