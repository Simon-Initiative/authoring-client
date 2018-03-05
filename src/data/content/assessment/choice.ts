import * as Immutable from 'immutable';

import { Html } from '../html';
import { augment } from '../common';

export type ChoiceParams = {
  value?: string,
  color?: string,
  body?: Html,
  guid?: string,
};

const defaultContent = {
  contentType: 'Choice',
  value: '',
  color: '',
  body: new Html(),
  guid: '',
};

function simplifyBody(body: Object) : Object {

  if (body['#array'] !== undefined) {
    const arr = body['#array'];
    if (arr.length === 1) {
      if (arr[0].p !== undefined && arr[0].p['#text'] !== undefined) {
        return { '#text': arr[0].p['#text'] };
      }
      if (arr[0].p !== undefined && arr[0].p['#array'] !== undefined) {
        const c = arr[0].p;
        delete c['@id'];
        delete c['@title'];
        return c;
      }
    }
  }

  return body;

}

export class Choice extends Immutable.Record(defaultContent) {

  contentType: 'Choice';
  value: string;
  color: string;
  body: Html;
  guid: string;

  constructor(params?: ChoiceParams) {
    super(augment(params));
  }

  with(values: ChoiceParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(root: Object, guid: string) {

    const choice = (root as any).choice;
    let model = new Choice({ guid });

    if (Object.keys(choice).length === 1 && choice['@value'] !== undefined) {
      choice['#text'] = choice['@value'];
    }

    const body = Html.fromPersistence(choice, '');
    model = model.with({ body });

    if (choice['@value'] !== undefined) {
      model = model.with({ value: choice['@value'] });
    }
    if (choice['@color'] !== undefined) {
      model = model.with({ color: choice['@color'] });
    }

    return model;
  }

  toPersistence() : Object {

    const body = this.body.toPersistence();

    // Ensure that single paragraph responses are not wrapped with a p tag.
    // While this doesn't violate the DTD, it leads to an undesirable effect
    // when questions are rendered in legacy OLI
    const simplifiedBody = simplifyBody(body);

    const root = { choice: simplifiedBody };

    if (root.choice['#text'] === '') {
      root.choice['#text'] = 'Placeholder';
    }

    root.choice['@value'] = this.value;
    root.choice['@color'] = this.color;

    return root;
  }
}
