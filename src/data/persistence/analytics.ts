import { Map } from 'immutable';
import { authenticatedFetch } from './common';
import { configuration } from '../../actions/utils/config';
import {
  DataSet, DatasetStatus, AnalyticsByResource, AnalyticsByPart, AnalyticsBySkill,
} from 'types/analytics/dataset';
import { caseOf } from 'utils/utils';

const parseDatasetJson = (json: any): DataSet => ({
  byResource: json.datasetBlob && json.datasetBlob.jsonObject.byResource.reduce(
    (acc, val) => acc.set(val.resource, val),
    Map<string, AnalyticsByResource>(),
  ),
  byPart: json.datasetBlob && json.datasetBlob.jsonObject.byPart.reduce(
    (acc, val) => acc.set(val.id, val),
    Map<string, AnalyticsByPart>(),
  ),
  bySkill: json.datasetBlob && json.datasetBlob.jsonObject.bySkill.reduce(
    (acc, val) => acc.set(val.skill, val),
    Map<string, AnalyticsBySkill>(),
  ),
  status: caseOf<DatasetStatus>(json.status)({
    DONE: DatasetStatus.DONE,
    FAILED: DatasetStatus.FAILED,
    PROCESSING: DatasetStatus.PROCESSING,
  })(DatasetStatus.DONE),
  dateCreated: json.dateCreated,
  dateCompleted: json.dateCompleted,
});

type FetchDataSetResponse = DataSet;

export function fetchDataSet(dataSetId: string): Promise<FetchDataSetResponse> {

  const url = `${configuration.baseUrl}/analytics/dataset/${dataSetId}`;
  const method = 'GET';

  return (authenticatedFetch({ url, method }) as any)
    .then((json) => {
      return parseDatasetJson(json);
    });
}

type GetAllDataSetsResponse = DataSet[];

export function getAllDataSets(courseId: string): Promise<GetAllDataSetsResponse> {

  const url = `${configuration.baseUrl}/analytics/${courseId}`;
  const method = 'GET';

  return (authenticatedFetch({ url, method }) as any)
    .then((jsonArray) => {
      return jsonArray.map(json => parseDatasetJson(json));
    });
}

type CreateDatasetResponse = {
  guid: string,
  message: string,
};

export function createDataSet(courseId: string): Promise<CreateDatasetResponse> {

  const url = `${configuration.baseUrl}/analytics/dataset/${courseId}`;
  const method = 'POST';

  return (authenticatedFetch({ url, method }) as any)
    .then((json) => {
      return json as CreateDatasetResponse;
    });
}

