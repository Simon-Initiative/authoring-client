import * as contentTypes from '../../../data/contentTypes';

export function describePool(pool: contentTypes.Pool) {
  const count = this.state.pool.questions.size; 
  return count + ' question' + (count !== 1 ? 's' : '');
}
