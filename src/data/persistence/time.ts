import { authenticatedFetch } from './common';
import { configuration } from '../../actions/utils/config';

export function fetchServerTime(): Promise<Date> {
  
  // The final impl will look something like this:
  const url = `${configuration.baseUrl}/polls/server/time`;
  
  return authenticatedFetch({ url })
    .then(result => new Date(result.serverTime));
}
