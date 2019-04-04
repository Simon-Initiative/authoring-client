import { fetchDataSet } from 'data/persistence';
import { Maybe } from 'tsmonad';

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
  dataSet: Object,
};

export const dataSetReceived = (
  dataSet: Object,
): DataSetReceivedAction => ({
  type: DATASET_RECEIVED,
  dataSet,
});


export function requestDataSet(dataSetId: string) {
  return function (dispatch, getState) {
    dispatch(requestedDataSet(dataSetId));
    poll(dataSetId, dispatch, getState);
  };
}

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
        dispatch(dataSetReceived(result));
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
