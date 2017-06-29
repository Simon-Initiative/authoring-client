
import * as contentTypes from './contentTypes';
import * as models from './models';

export function initWorkbook(titleText: string) : models.WorkbookPageModel {
  const title = new contentTypes.Title({ text: titleText });
  return new models.WorkbookPageModel({
    head: new contentTypes.Head({ title }),
  });
}
