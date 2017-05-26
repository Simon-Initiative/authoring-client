import * as contentTypes from '../../../data/contentTypes';

export function describePool(pool: contentTypes.Pool) {
  const count = pool.questions.size; 
  return pool.title.text + '  (' + count + ' question' + (count !== 1 ? 's' : '') + ')';
}
