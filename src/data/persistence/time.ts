import { authenticatedFetch } from './common';
import { configuration } from '../../actions/utils/config';

export function fetchServerTime(): Promise<Date> {
  
  // The final impl will look something like this:
  // const url = `${configuration.baseUrl}/time`;
  // return authenticatedFetch({ url })
  //  .then(result => new Date(result));

  return Promise.resolve(new Date());

}
