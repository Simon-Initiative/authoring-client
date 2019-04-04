import { authenticatedFetch } from './common';
import { configuration } from '../../actions/utils/config';

export function fetchDataSet(dataSetId: string): Promise<Object> {

  const url = `${configuration.baseUrl}/analytics/dataset/${dataSetId}`;
  const method = 'GET';

  return (authenticatedFetch({ url, method }) as any)
    .then((json) => {
      return json;
    });
}


export function getAllDataSets(courseId: string): Promise<Object[]> {

  const url = `${configuration.baseUrl}/analytics/${courseId}`;
  const method = 'GET';

  return (authenticatedFetch({ url, method }) as any)
    .then((json) => {
      return json;
    });
}



export function createDataSet(courseId: string): Promise<Object> {

  const url = `${configuration.baseUrl}/analytics/${courseId}`;
  const method = 'POST';

  return (authenticatedFetch({ url, method }) as any)
    .then((json) => {
      return json;
    });
}

