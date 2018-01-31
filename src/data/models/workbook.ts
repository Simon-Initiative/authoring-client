import * as Immutable from 'immutable';
import * as contentTypes from '../contentTypes';
import guid from '../../utils/guid';
import { getKey } from '../common';
import { isArray } from 'util';
import { BodyContent } from 'data/content/workbook/types/body';
import { TextContent } from 'data/content/common/text';

import { LegacyTypes } from '../types';


export type WorkbookPageModelParams = {
  resource?: contentTypes.Resource,
  guid?: string,
  type?: string;
  head?: contentTypes.Head,
  body?: BodyContent,
  lock?: contentTypes.Lock
};

const defaultWorkbookPageModelParams = {
  modelType: 'WorkbookPageModel',
  resource: new contentTypes.Resource(),
  guid: '',
  type: LegacyTypes.workbook_page,
  head: new contentTypes.Head(),
  body: new BodyContent(),
  lock: new contentTypes.Lock(),
};

export class WorkbookPageModel extends Immutable.Record(defaultWorkbookPageModelParams) {

  modelType: 'WorkbookPageModel';
  resource: contentTypes.Resource;
  guid: string;
  type: string;
  head: contentTypes.Head;
  body: BodyContent;
  lock: contentTypes.Lock;

  constructor(params?: WorkbookPageModelParams) {
    params ? super(params) : super();
  }

  with(values: WorkbookPageModelParams) {
    return this.merge(values) as this;
  }

  static createNew(id: string, title: string, body: string) {

    return new WorkbookPageModel({
      head: new contentTypes.Head({ title:
        new contentTypes.Title({ text: TextContent.fromText(title, '') }) }),
      resource: new contentTypes.Resource({ id, title }),
      guid: id,
      body: BodyContent.fromText(body, ''),
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
          model = model.with({ body: BodyContent.fromPersistence(item.body, id) });
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
