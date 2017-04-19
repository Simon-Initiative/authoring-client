import * as Immutable from 'immutable';

import { Html } from './html';
import createGuid from '../../utils/guid';
import { getKey } from '../common';

export type HintParams = {
  targets?: string,
  body?: Html
  guid?: string
};

const defaultContent = {
  contentType: 'Hint',
  targets: '',
  body: new Html(),
  guid: createGuid()
}

export class Hint extends Immutable.Record(defaultContent) {
  
  contentType: 'Hint';
  targets: string;
  body: Html;
  guid: string;
  
  constructor(params?: HintParams) {
    params ? super(params) : super();
  }

  with(values: HintParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(root: Object, guid: string) : Hint {

    let hint = (root as any).hint;

    let model = new Hint({ guid });
    model = model.with({ body: Html.fromPersistence(hint, '')});
    
    if (hint['@targets'] !== undefined) {
      model = model.with({ targets: hint['@targets']});
    }
    
    return model;
  }

  toPersistence() : Object {

    const body = this.body.toPersistence();
    const hint = { hint: (body as any) };

    hint.hint['@targets'] = this.targets;

    return hint;
  }
}
