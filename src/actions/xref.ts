import { ContentElement } from 'data/content/common/interfaces';
import { State } from 'reducers/index';
import { Dispatch } from 'redux';
import * as persistence from 'data/persistence';
import { WorkbookPageModel } from 'data/models';
import { findNodes } from 'data/models/utils/workbook';
import { Either } from 'tsmonad';
import { ContiguousText } from 'data/contentTypes';

export type SET_TARGET = 'SET_TARGET';
export const SET_TARGET = 'SET_TARGET';

export type MissingTargetId = string;

export type SetXrefTargetAction = {
  type: SET_TARGET,
  target: Either<MissingTargetId, ContentElement>,
};

function setTargetNode(node): SetXrefTargetAction {
  return {
    type: SET_TARGET,
    target: node,
  };
}

// targetId is an id
// documentId is a guid
export function fetchAndSetTargetNode(targetId: string, resourceId: string) {
  return (dispatch: Dispatch, getState: () => State): Promise<any> => {
    const { course } = getState();
    console.table(course);
    console.table(course.resources);
    console.table(course.resourcesById);
    console.log('target id: ' + targetId);
    console.log('resource id: ' + resourceId);
    console.log(course.resourcesById.get(resourceId));
    const documentId = course.resourcesById.get(resourceId).guid;
    console.log("#$%@ DOCUMENT ID: " + documentId);
    return persistence.retrieveDocument(course.idvers, documentId).then((doc) => {
      const wbpage = doc.model as WorkbookPageModel;
      // Find the target node in the workbook page's content tree
      const node = findNodes(
        wbpage,
        node => node.contentType === 'ContiguousText'
          ? (node as ContiguousText).getFirstReferenceId() === targetId
          : node.id === targetId)[0];
      dispatch(setTargetNode(node ? Either.right(node) : Either.left(targetId)));
    });
  };
}
