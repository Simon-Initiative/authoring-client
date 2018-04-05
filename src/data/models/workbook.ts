import * as Immutable from 'immutable';
import * as contentTypes from '../contentTypes';
import guid from '../../utils/guid';
import { getKey } from '../common';
import { isArray } from 'util';
import { ContentElements, TEXT_ELEMENTS, BODY_ELEMENTS } from 'data/content/common/elements';

import { LegacyTypes } from '../types';
import { WB_BODY_EXTENSIONS } from 'data/content/workbook/types';

const WB_ELEMENTS = [...BODY_ELEMENTS, ...WB_BODY_EXTENSIONS];

export type WorkbookPageModelParams = {
  resource?: contentTypes.Resource,
  guid?: string,
  type?: string;
  head?: contentTypes.Head,
  body?: ContentElements,
  lock?: contentTypes.Lock
};

const defaultWorkbookPageModelParams = {
  modelType: 'WorkbookPageModel',
  resource: new contentTypes.Resource(),
  guid: '',
  type: LegacyTypes.workbook_page,
  head: new contentTypes.Head(),
  body: new ContentElements(),
  lock: new contentTypes.Lock(),
};

export class WorkbookPageModel extends Immutable.Record(defaultWorkbookPageModelParams) {

  modelType: 'WorkbookPageModel';
  resource: contentTypes.Resource;
  guid: string;
  type: string;
  head: contentTypes.Head;
  body: ContentElements;
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
        new contentTypes.Title({ text: ContentElements.fromText(title, '', TEXT_ELEMENTS) }) }),
      resource: new contentTypes.Resource({ id, title }),
      guid: id,
      body: ContentElements.fromText(body, '', WB_ELEMENTS),
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
          model = model.with({ body: ContentElements
            .fromPersistence(item.body, id, WB_ELEMENTS) });
          break;
        default:
      }
    });

    return model;
  }

  toPersistence(): Object {

    const content = this.body.content.size === 0
       ? [{ p: { '#text': ' ' } }]
       : this.body.toPersistence();

    const doc = [{
      workbook_page: {
        '@id': this.resource.id,
        '#array': [
          this.head.toPersistence(),
          { body: { '#array': content } },
        ],
      },
    }];

    const root = {
      doc,
    };

    return Object.assign({}, this.resource, root, this.lock.toPersistence());
  }
}
