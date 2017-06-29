import * as Immutable from 'immutable';
import * as contentTypes from '../contentTypes';
import guid from '../../utils/guid';
import { getKey } from '../common';
import { isNullOrUndefined, isArray } from 'util';


export type WorkbookPageModelParams = {
  resource?: contentTypes.Resource,
  guid?: string,
  type?: string;
  head?: contentTypes.Head,
  body?: contentTypes.Html,
  lock?: contentTypes.Lock
};

const defaultWorkbookPageModelParams = {
  modelType: 'WorkbookPageModel',
  resource: new contentTypes.Resource(),
  guid: '',
  type: 'x-oli-workbook_page',
  head: new contentTypes.Head(),
  body: new contentTypes.Html(),
  lock: new contentTypes.Lock(),
};

export class WorkbookPageModel extends Immutable.Record(defaultWorkbookPageModelParams) {

  modelType: 'WorkbookPageModel';
  resource: contentTypes.Resource;
  guid: string;
  type: string;
  head: contentTypes.Head;
  body: contentTypes.Html;
  lock: contentTypes.Lock;

  constructor(params?: WorkbookPageModelParams) {
    params ? super(params) : super();
  }

  with(values: WorkbookPageModelParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(json: Object): WorkbookPageModel {
    let model = new WorkbookPageModel();
      
    const wb = (json as any);
    model = model.with({ resource: contentTypes.Resource.fromPersistence(wb) });
    model = model.with({ guid: wb.guid });
    model = model.with({ type: wb.type });
    if (wb.lock !== undefined && wb.lock !== null) {
      model = model.with({ lock: contentTypes.Lock.fromPersistence(wb.lock) });
    }

    let workbook = null;
    if (isArray(wb.doc)) {
      workbook = wb.doc[0].workbook_page;
    } else {
      workbook = wb.doc.workbook_page;
    }
      
    workbook['#array'].forEach((item) => {

      const key = getKey(item);
      const id = guid();

      switch (key) {
        case 'head':
          model = model.with({ head: contentTypes.Head.fromPersistence(item, id) });
          break;
        case 'body':
          model = model.with({ body: contentTypes.Html.fromPersistence(item, id) });
          break;
        default:
      }
    });
      
    return model;
  }

  toPersistence(): Object {        
    let resource: any = this.resource.toPersistence();
    let doc = null;
    if (isNullOrUndefined(this.guid) || this.guid === '') {
      // Assume new workbook page created if guid is null
      // Generate artificial id from title
      try {
        const title = this.head.title.text;
        const g = guid();
        const id = title.toLowerCase().split(' ')[0] + g.substring(g.lastIndexOf('-'));
        resource = new contentTypes.Resource({ id, title });
      } catch (err) {
        console.log(err);
        return null;
      }
      doc = [{
        workbook_page: {
          '@id': resource.id,
          '#array': [
            this.head.toPersistence(),
            {
              body: {
                p: {
                  '#text': '(This space intentionally left blank.)',
                },
              },
            },
          ],
        },
      }];
    } else {
      doc = [{
        workbook_page: {
          '@id': resource.id,
          '#array': [
            this.head.toPersistence(),
            { body: this.body.toPersistence() },
          ],
        },
      }];
    }
    const root = {
      doc,
    };
      
    return Object.assign({}, resource, root, this.lock.toPersistence());
  }
}
