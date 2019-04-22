import { Map, List } from 'immutable';
import { fetchDataSet, createDataSet } from 'data/persistence';
import { Maybe } from 'tsmonad';
import { showMessage, dismissSpecificMessage } from 'actions/messages';
import { DataSet, DatasetStatus } from 'types/analytics/dataset';
import { Dispatch } from 'redux';
import { State } from 'reducers';
import { dateFormatted } from 'utils/date';
import { Message, Severity, TitledContent, Scope, MessageAction } from 'types/messages';
import { Priority } from 'types/messages/message';

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
    dispatch(requestDataSet(guid, true));
  };


export const requestDataSet = (dataSetId: string, isNewDataset?: boolean) =>
  (dispatch: Dispatch, getState: () => State) => {
    dispatch(requestedDataSet(dataSetId));
    poll(dataSetId, isNewDataset, dispatch, getState);
  };

function isRequestStillActive(original: string, getState): boolean {
  if (getState().course === null) return false;

  const requestedDataSetId: Maybe<string> = getState().analytics.requestedDataSetId;
  return requestedDataSetId.caseOf({
    just: id => id === original,
    nothing: () => false,
  });
}

const TIME_TO_WAIT = 10 * 1000;   // 10 seconds

const analyticsDoneOrFailedMessage = (status: DatasetStatus): Message =>
  status === DatasetStatus.DONE
    ? (
      new Message().with({
        severity: Severity.Information,
        scope: Scope.CoursePackage,
        priority: Priority.Medium,
        guid: 'ANALYTICS_DONE_OR_FAILED_MESSAGE',
        canUserDismiss: true,
        content: new TitledContent().with({
          title: 'Dataset Creation Complete',
          message: 'This course package is now showing analytics using the latest dataset',
        }),
      })
    )
    : (
      new Message().with({
        severity: Severity.Error,
        scope: Scope.CoursePackage,
        priority: Priority.Medium,
        guid: 'ANALYTICS_DONE_OR_FAILED_MESSAGE',
        canUserDismiss: true,
        content: new TitledContent().with({
          title: 'Dataset Creation Failed',
          message: 'Something went wrong while creating a new dataset for this course',
        }),
      })
    );

function poll(dataSetId: string, isNewDataset: boolean, dispatch, getState) {
  fetchDataSet(dataSetId).then((result) => {
    if (isRequestStillActive(dataSetId, getState)) {
      dispatch(dataSetReceived(dataSetId, result));
      if (result.status === DatasetStatus.PROCESSING) {
        setTimeout(
          () => {
            if (isRequestStillActive(dataSetId, getState)) {
              poll(dataSetId, isNewDataset, dispatch, getState);
            }
          },
          TIME_TO_WAIT);
      } else if (isNewDataset) {
        dispatch(showMessage(analyticsDoneOrFailedMessage(result.status)));
      }
    }
  })
  .catch((err) => {
    dispatch(dataSetReceived(dataSetId, {
      byResource: Maybe.nothing(),
      byResourcePart: Maybe.nothing(),
      bySkill: Maybe.nothing(),
      status: DatasetStatus.FAILED,
      dateCreated: dateFormatted(new Date()),
      dateCompleted: dateFormatted(new Date()),
    }));
  });
}
