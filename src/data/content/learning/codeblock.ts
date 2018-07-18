import * as Immutable from 'immutable';

import createGuid from '../../../utils/guid';
import { augment } from '../common';

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
    super(augment(params));
  }

  with(values: CodeBlockParams) {
    return this.merge(values) as this;
  }

  clone() : CodeBlock {
    return this.with({
      id: createGuid(),
    });
  }

  static fromPersistence(root: Object, guid: string) : CodeBlock {

    const cb = (root as any).codeblock;

    let model = new CodeBlock({ guid });

    if (cb['@id'] !== undefined) {
      model = model.with({ id: cb['@id'] });
    } else {
      model = model.with({ id: createGuid() });
    }
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
