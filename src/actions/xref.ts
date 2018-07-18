import { ContentElement } from 'data/content/common/interfaces';
import { State } from 'reducers/index';
import { Dispatch } from '../../node_modules/redux';
import * as persistence from 'data/persistence';
import { WorkbookPageModel } from 'data/models';
import { findNodes } from 'data/models/utils/workbook';
import { Either } from 'tsmonad';

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
export function fetchAndSetTargetNode(targetId: string, documentId: string) {
  return (dispatch: Dispatch<State>, getState: () => State): Promise<any> => {
    // console.log({ targetId, documentId });
    const { course } = getState();
    // console.log({ course });
    return persistence.retrieveDocument(course.guid, documentId).then((doc) => {
      const wbpage = doc.model as WorkbookPageModel;
      // console.log({ wbpage });
      // Find the target node in the workbook page's content tree
      const node = findNodes(wbpage, node => node.id === targetId)[0];
      console.log({ node });
      dispatch(setTargetNode(node ? Either.right(node) : Either.left(targetId)));
    });
  };
}
