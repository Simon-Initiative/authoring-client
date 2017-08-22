import * as Immutable from 'immutable';
import * as contentTypes from '../contentTypes';
import guid from '../../utils/guid';
import { getKey } from '../common';
import { isNullOrUndefined, isArray } from 'util';
import { ContentState } from 'draft-js';

const emptyContent = ContentState.createFromText('');

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

  static createNew(id: string, title: string, body: string) {

    return new WorkbookPageModel({
      head: new contentTypes.Head({ title: new contentTypes.Title({ text: title }) }),
      resource: new contentTypes.Resource({ id, title }),
      guid: id,
      body: new contentTypes.Html({ contentState: ContentState.createFromText(body) }),
    });
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
    
    const doc = [{
      workbook_page: {
        '@id': this.resource.id,
        '#array': [
          this.head.toPersistence(),
          { body: this.body.toPersistence() },
        ],
      },
    }];
    
    const root = {
      doc,
    };
      
    return Object.assign({}, this.resource, root, this.lock.toPersistence());
  }
}
