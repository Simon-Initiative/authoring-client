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
