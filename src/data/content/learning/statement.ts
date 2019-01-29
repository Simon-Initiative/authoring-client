import * as Immutable from 'immutable';
import { augment, ensureIdGuidPresent, setId } from '../common';
import { ContentElements, MATERIAL_ELEMENTS } from 'data/content/common/elements';
import createGuid from 'utils/guid';

export type StatementParams = {
  content?: ContentElements,
  id?: string,
  guid?: string,
};

const defaultContent = {
  contentType: 'Statement',
  elementType: 'statement',
  id: '',
  content: new ContentElements().with({ supportedElements: Immutable.List(MATERIAL_ELEMENTS) }),
  guid: '',
};


export class Statement extends Immutable.Record(defaultContent) {

  contentType: 'Statement';
  elementType: 'statement';
  content: ContentElements;
  id: string;
  guid: string;

  constructor(params?: StatementParams) {
    super(augment(params));
  }

  with(values: StatementParams) {
    return this.merge(values) as this;
  }

  clone(): Statement {
    return ensureIdGuidPresent(this.with({
      content: this.content.clone(),
    }));
  }

  static fromPersistence(root: Object, guid: string, notify: () => void): Statement {

    const t = (root as any).statement;

    let model = new Statement({
      guid,
      content: ContentElements.fromPersistence(t, '', MATERIAL_ELEMENTS, null, notify),
    });

    model = setId(model, t, notify);

    return model;
  }

  toPersistence(): Object {
    const t = {
      statement: {
        '@id': this.id ? this.id : createGuid(),
        '#array': this.content.toPersistence(),
      },
    };

    return t;
  }
}
