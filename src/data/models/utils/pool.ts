import { ContentElement } from 'data/content/common/interfaces';

import * as models from 'data/models';
import { visitNodes } from 'data/utils/tree';
import { getChildren } from './navigation';

// Given a pool model and a predicate, find all content type
// instances (aka ContentElements) that meet the predicate
export function findNodes(
  model: models.PoolModel,
  predicate: (node: ContentElement) => boolean): ContentElement[] {

  const matching = [];
  const visitor = (n) => {
    if (predicate(n)) {
      matching.push(n);
    }
  };

  visitNodes(visitor, model.pool, getChildren);

  return matching;
}
