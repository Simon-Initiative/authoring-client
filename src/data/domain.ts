import * as contentTypes from './contentTypes';
import * as models from './models';

export function initWorkbook(titleText: string) : models.WorkbookPageModel {
  const title = contentTypes.Title.fromText(titleText);
  return new models.WorkbookPageModel({
    head: new contentTypes.Head({ title }),
  });
}
