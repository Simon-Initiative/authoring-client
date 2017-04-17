import * as Immutable from 'immutable';

import { Html } from './html';
import createGuid from '../../utils/guid';
import { getKey } from '../common';

export type ChoiceParams = {
  value?: string,
  color?: string,
  body?: Html,
  guid?: string
};

const defaultContent = {
  contentType: 'Choice',
  value: '',
  color: '',
  body: new Html(),
  guid: ''
}

export class Choice extends Immutable.Record(defaultContent) {
  
  contentType: 'Choice';
  value: string;
  color: string;
  body: Html;
  guid: string;
  
  constructor(params?: ChoiceParams) {
    params ? super(params) : super();
  }

  with(values: ChoiceParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(root: Object, guid: string) {

    let choice = (root as any).choice;
    let model = new Choice({ guid });
    
    let body = Html.fromPersistence(choice, '');
    model = model.with({ body });

    if (choice['@value'] !== undefined) {
      model = model.with({ value: choice['@value']});
    }
    if (choice['@color'] !== undefined) {
      model = model.with({ color: choice['@color']});
    }
    
    return model;
  }

  toPersistence() : Object {
    const body = this.body.toPersistence();
    const root = { choice: body };

    root.choice['@value'] = this.value;
    root.choice['@color'] = this.color;
    
    return root;
  }
}
