import { Map } from 'immutable';
import { fetchDataSet, createDataSet } from 'data/persistence';
import { Maybe } from 'tsmonad';

import { DataSet, DatasetStatus } from 'types/analytics/dataset';
import { Dispatch } from 'redux';
import { State } from 'reducers';
import { dateFormatted } from 'utils/date';

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
  dataSet: DataSet,
};

export const dataSetReceived = (
  id: string,
  dataSet: DataSet,
): DataSetReceivedAction => ({
  type: DATASET_RECEIVED,
  dataSetId: id,
  dataSet,
});

export const createNewDataSet = () =>
  async (dispatch: Dispatch<any>, getState: () => State) => {
    const packageId = getState().course.guid;
    const { guid } = await createDataSet(packageId);
    dispatch(requestDataSet(guid));
  };


export const requestDataSet = (dataSetId: string) =>
  (dispatch: Dispatch, getState: () => State) => {
    dispatch(requestedDataSet(dataSetId));
    poll(dataSetId, dispatch, getState);
  };

function isAvailable(dataSet: DataSet) {
  // Replace this with an actual implementation
  return dataSet.status === DatasetStatus.DONE
    || dataSet.status === DatasetStatus.FAILED;
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
      dispatch(dataSetReceived(dataSetId, result));
      if (result.status === DatasetStatus.PROCESSING) {
        setTimeout(
          () => {
            if (isRequestStillActive(dataSetId, getState)) {
              poll(dataSetId, dispatch, getState);
            }
          },
          TIME_TO_WAIT);
      }
    }
  })
  .catch((err) => {
    dispatch(dataSetReceived(dataSetId, {
      byResource: Map(),
      byResourcePart: Map(),
      bySkill: Map(),
      status: DatasetStatus.FAILED,
      dateCreated: dateFormatted(new Date()),
      dateCompleted: dateFormatted(new Date()),
    }));
  });
}
