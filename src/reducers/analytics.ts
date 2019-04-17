import { Record } from 'immutable';
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
import { DataSet, DatasetStatus } from 'types/analytics/dataset';

export type ActionTypes = RequestedDataSetAction
  | DataSetReceivedAction | CourseChangedAction | OtherAction;

export type AnalyticsStateParams = {
  requestedDataSetId: Maybe<string>,
  dataSet: Maybe<DataSet>,
};

const defaults = (params: Partial<AnalyticsStateParams> = {}) => ({
  requestedDataSetId: params.requestedDataSetId || Maybe.nothing<string>(),
  dataSet: params.dataSet || Maybe.nothing<DataSet>(),
});

export class AnalyticsState extends Record(defaults()) {
  requestedDataSetId: Maybe<string>;
  dataSet: Maybe<DataSet>;

  constructor(params?: Partial<AnalyticsStateParams>) {
    super(defaults(params));
  }

  with(values: Partial<AnalyticsStateParams>) {
    return this.merge(values) as this;
  }
}

const initialState = new AnalyticsState();

export const analytics = (
  state: AnalyticsState = initialState,
  action: ActionTypes,
): AnalyticsState => {
  switch (action.type) {
    case DATASET_RECEIVED:
      return state.with({
        requestedDataSetId: action.dataSet.status === DatasetStatus.PROCESSING
          ? state.requestedDataSetId
          : Maybe.nothing(),
        dataSet: Maybe.just(action.dataSet),
      });
    case REQUESTED_DATASET:
      return state.with({
        requestedDataSetId: Maybe.just(action.dataSetId),
      });
    case COURSE_CHANGED:
      return initialState;
    default:
      return state;
  }
};
