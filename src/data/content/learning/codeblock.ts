import * as Immutable from 'immutable';

import createGuid from '../../../utils/guid';
import { augment, ensureIdGuidPresent, setId } from '../common';

export type CodeBlockParams = {
  id?: string,
  title?: string,
  source?: string,
  syntax?: string,
  number?: boolean,
  start?: string,
  highlight?: string,
  guid?: string,
};

const defaultContent = {
  contentType: 'CodeBlock',
  elementType: 'codeblock',
  id: '',
  title: '',
  source: '',
  syntax: 'text',
  number: false,
  start: '',
  highlight: '',
  guid: '',
};

export class CodeBlock extends Immutable.Record(defaultContent) {

  contentType: 'CodeBlock';
  elementType: 'codeblock';
  id: string;
  title: string;
  source: string;
  syntax: string;
  number: boolean;
  start: string;
  highlight: string;
  guid: string;

  constructor(params?: CodeBlockParams) {
    super(augment(params, true));
  }

  with(values: CodeBlockParams) {
    return this.merge(values) as this;
  }

  clone() : CodeBlock {
    return ensureIdGuidPresent(this);
  }

  static fromPersistence(root: Object, guid: string, notify) : CodeBlock {

    const cb = (root as any).codeblock;

    let model = new CodeBlock({ guid });

    model = setId(model, cb, notify);

    if (cb['@title'] !== undefined) {
      model = model.with({ title: cb['@title'] });
    }
    if (cb['@syntax'] !== undefined) {
      model = model.with({ syntax: cb['@syntax'] });
    }
    if (cb['@highlight'] !== undefined) {
      model = model.with({ highlight: cb['@highlight'] });
    }
    if (cb['@number'] !== undefined) {
      model = model.with({ number: cb['@number'] === 'true' });
    }
    if (cb['@start'] !== undefined) {
      model = model.with({ start: cb['@start'] });
    }
    if (cb['#text'] !== undefined) {
      model = model.with({ source: cb['#text'] });
    }
    if (cb['#cdata'] !== undefined) {
      model = model.with({ source: cb['#cdata'] });
    }
    return model;
  }

  toPersistence() : Object {
    return {
      codeblock: {
        '@id': this.id ? this.id : createGuid(),
        '@syntax': this.syntax,
        '@title': this.title,
        '@highlight': this.highlight,
        '@number': this.number ? 'true' : 'false',
        '@start': this.start,
        '#text': this.source,
      },
    };
  }
}
