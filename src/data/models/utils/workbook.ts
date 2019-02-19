
import * as models from 'data/models';
import { ContentElement } from 'data/content/common/interfaces';
import { visitNodes } from 'data/utils/tree';
import { getChildren } from './navigation';

// Given a workbook page model and a predicate, find all content type
// instances (aka ContentElements) that meet the predicate
export function findNodes(
  model: models.WorkbookPageModel,
  predicate: (node: ContentElement) => boolean): ContentElement[] {

  const matching = [];
  const visitor = (n) => {
    if (predicate(n)) {
      matching.push(n);
    }
  };

  visitNodes(visitor, model.body.content, getChildren);

  visitor(model.bibliography);
  visitNodes(visitor, model.bibliography, getChildren);

  return matching;
}


