import * as Immutable from 'immutable';

import createGuid from '../../../utils/guid';
import { augment } from '../common';
import { getKey } from '../../common';

export type CodeBlockParams = {
  source?: string,
  syntax?: string,
  number?: boolean,
  start?: string,
  highlight?: string,
  guid?: string
};

const defaultContent = {
  contentType: 'CodeBlock',
  source: '',
  syntax: 'text',
  number: false,
  start: '',
  highlight: '',
  guid: ''
}

export class CodeBlock extends Immutable.Record(defaultContent) {
  
  contentType: 'CodeBlock';
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

  static fromPersistence(root: Object, guid: string) : CodeBlock {

    let cb = (root as any).codeblock;

    let model = new CodeBlock({ guid });
    
    if (cb['@syntax'] !== undefined) {
      model = model.with({ syntax: cb['@syntax']});
    }
    if (cb['@highlight'] !== undefined) {
      model = model.with({ highlight: cb['@highlight']});
    }
    if (cb['@number'] !== undefined) {
      model = model.with({ number: cb['@number'] === 'true'});
    }
    if (cb['@start'] !== undefined) {
      model = model.with({ start: cb['@start']});
    }
    if (cb['#text'] !== undefined) {
      model = model.with({ source: cb['#text']});
    }
    
    return model;
  }

  toPersistence() : Object {
    return {
      codeblock: {
        '@syntax': this.syntax,
        '@highlight': this.highlight,
        '@number': this.number ? 'true' : 'false',
        '@start': this.start,
        '#text': this.source
      } 
    };
  }
}
