import * as Immutable from 'immutable';
import * as contentTypes from 'data/contentTypes';
import guid from 'utils/guid';
import { getKey } from 'data/common';
import { isArray } from 'util';
import { ContentElements, TEXT_ELEMENTS, BODY_ELEMENTS } from 'data/content/common/elements';
import { LegacyTypes } from 'data/types';
import { WB_BODY_EXTENSIONS } from 'data/content/workbook/types';
import { Maybe } from 'tsmonad';

const WB_ELEMENTS = [...BODY_ELEMENTS, ...WB_BODY_EXTENSIONS];

export const NEW_PAGE_CONTENT =
  'This is a new page with empty contents.';

export type WorkbookPageModelParams = {
  resource?: contentTypes.Resource,
  guid?: string,
  type?: string;
  head?: contentTypes.Head,
  body?: ContentElements,
  lock?: contentTypes.Lock,
  bibliography?: contentTypes.Bibliography,
  dependencies?: Maybe<contentTypes.WbDependencies>,
};

const defaultWorkbookPageModelParams = {
  modelType: 'WorkbookPageModel',
  resource: new contentTypes.Resource(),
  guid: '',
  type: LegacyTypes.workbook_page,
  head: new contentTypes.Head(),
  body: new ContentElements(),
  lock: new contentTypes.Lock(),
  bibliography: new contentTypes.Bibliography(),
  dependencies: Maybe.nothing(),
};

export class WorkbookPageModel extends Immutable.Record(defaultWorkbookPageModelParams) {

  modelType: 'WorkbookPageModel';
  resource: contentTypes.Resource;
  guid: string;
  type: string;
  head: contentTypes.Head;
  body: ContentElements;
  lock: contentTypes.Lock;
  bibliography: contentTypes.Bibliography;
  dependencies: Maybe<contentTypes.WbDependencies>;

  constructor(params?: WorkbookPageModelParams) {
    params ? super(params) : super();
  }

  with(values: WorkbookPageModelParams) {
    return this.merge(values) as this;
  }

  static createNew(id: string, title: string, body: string) {
    return new WorkbookPageModel({
      head: new contentTypes.Head({
        title:
          new contentTypes.Title({ text: ContentElements.fromText(title, '', TEXT_ELEMENTS) }),
      }),
      resource: new contentTypes.Resource({ id, title }),
      guid: id,
      body: ContentElements.fromText(body, '', WB_ELEMENTS),
    });
  }

  static fromPersistence(json: Object, notify: () => void): WorkbookPageModel {
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
          model = model.with({ head: contentTypes.Head.fromPersistence(item, id, notify) });
          break;
        case 'body':
          model = model.with({
            body: ContentElements
              .fromPersistence(item.body, id, WB_ELEMENTS, null, notify),
          });
          break;
        case 'bib:file':
          model = model.with(
            { bibliography: contentTypes.Bibliography.fromPersistence(item, id, notify) });
          break;
        case 'dependencies':
          model = model.with({
            dependencies: Maybe.just(contentTypes.WbDependencies.fromPersistence(item, id, notify)),
          });
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

    const children = [
      this.head.toPersistence(),
      { body: { '#array': content } },
    ];

    this.dependencies.lift((deps) => {
      if (deps.size > 0) {
        children.push(deps.toPersistence());
      }
    });

    if (this.bibliography.bibEntries.size > 0) {
      children.push(this.bibliography.toPersistence());
    }

    const doc = [{
      workbook_page: {
        '@id': this.resource.id,
        '#array': children,
      },
    }];

    const root = {
      doc,
    };

    return Object.assign({}, this.resource, root, this.lock.toPersistence());
  }
}
