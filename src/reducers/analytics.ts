import {
  RequestedDataSetAction,
  REQUESTED_DATASET,
  DataSetReceivedAction,
  DATASET_RECEIVED,
} from 'actions/analytics';
import {
  COURSE_CHANGED, CourseChangedAction,
} from 'actions/course';
import { OtherAction } from './utils';
import { Maybe } from 'tsmonad';

export type ActionTypes = RequestedDataSetAction
  | DataSetReceivedAction | CourseChangedAction | OtherAction;

export type AnalyticsState = {
  requestedDataSetId: Maybe<string>,
  dataSet: Maybe<Object>,
};

const initialState: AnalyticsState = {
  requestedDataSetId: Maybe.nothing(),
  dataSet: Maybe.nothing(),
};

export const analytics = (
  state: AnalyticsState = initialState,
  action: ActionTypes,
): AnalyticsState => {
  switch (action.type) {
    case DATASET_RECEIVED:
      return Object.assign(
        {},
        state,
        { requestedDataSetId: Maybe.nothing(), dataSet: Maybe.just(action.dataSet) });
    case REQUESTED_DATASET:
      return Object.assign(
        {},
        state,
        { requestedDataSetId: Maybe.just(action.dataSetId) });
    case COURSE_CHANGED:
      return initialState;
    default:
      return state;
  }
};
