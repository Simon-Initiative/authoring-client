import * as Immutable from 'immutable';
import { ContentModel } from 'data/models';
import { ContentElement } from 'data/content/common/interfaces';
import { findNodes } from 'data/models/utils/workbook';

export const collectInlines = (model: ContentModel): Immutable.Map<string, ContentElement> => {
  if (model.modelType === 'WorkbookPageModel') {
    const found = findNodes(model, (n) => {
      return n.contentType === 'WbInline';
    }).map(e => [e.idref, e]);

    return Immutable.Map<string, ContentElement>(found);
  }
  return Immutable.Map<string, ContentElement>();
};
