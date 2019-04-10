import { fetchDataSet } from 'data/persistence';
import { Maybe } from 'tsmonad';

import { MOCK_DATA_PRINCIPLES_OF_COMP } from 'types/analytics/mock_datasets';
import { DataSet } from 'types/analytics/dataset';
import { Dispatch } from 'redux';
import { State } from 'reducers';

export const REQUESTED_DATASET = 'analytics/REQUESTED_DATASET';
export type REQUESTED_DATASET = typeof REQUESTED_DATASET;

export type RequestedDataSetAction = {
  type: REQUESTED_DATASET,
  dataSetId: string,
};

export const requestedDataSet = (
  dataSetId: string,
): RequestedDataSetAction => ({
  type: REQUESTED_DATASET,
  dataSetId,
});


export const DATASET_RECEIVED = 'analytics/DATASET_RECEIVED';
export type DATASET_RECEIVED = typeof DATASET_RECEIVED;

export type DataSetReceivedAction = {
  type: DATASET_RECEIVED,
  dataSetId: string,
  dataSet: Object,
};

export const dataSetReceived = (
  id: string,
  dataSet: DataSet,
): DataSetReceivedAction => ({
  type: DATASET_RECEIVED,
  dataSetId: id,
  dataSet,
});


export const requestDataSet = (dataSetId: string) =>
  (dispatch: Dispatch, getState: () => State) => {
    dispatch(requestedDataSet(dataSetId));
    // poll(dataSetId, dispatch, getState);

    // TODO: REPLACE WITH ACTUAL IMPLEMENTAION
    dispatch(dataSetReceived(dataSetId, MOCK_DATA_PRINCIPLES_OF_COMP));
  };

function isAvailable(dataSet) {
  // Replace this with an actual implementation
  return false;
}

const TIME_TO_WAIT = 30 * 1000;

function isRequestStillActive(original: string, getState): boolean {
  const requestedDataSetId: Maybe<string> = getState().analytics.requestedDataSetId;
  return requestedDataSetId.caseOf({
    just: id => id === original,
    nothing: () => false,
  });
}

function poll(dataSetId: string, dispatch, getState) {
  fetchDataSet(dataSetId).then((result) => {

    if (isRequestStillActive(dataSetId, getState)) {
      if (isAvailable(result)) {
        // verify result is a valid dataset or convert result to valid dataset
        dispatch(dataSetReceived(dataSetId, result as DataSet));
      } else {
        setTimeout(
          () => {
            if (isRequestStillActive(dataSetId, getState)) {
              poll(dataSetId, dispatch, getState);
            }
          },
          TIME_TO_WAIT);
      }
    }
  });
}
