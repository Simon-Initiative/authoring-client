import * as Immutable from 'immutable';

import { ContentElements, FLOW_ELEMENTS } from 'data/content/common/elements';

import { augment } from '../common';

export type ChoiceParams = {
  value?: string,
  color?: string,
  body?: ContentElements,
  guid?: string,
};

const defaultContent = {
  contentType: 'Choice',
  elementType: 'choice',
  value: '',
  color: '',
  body: new ContentElements().with({ supportedElements: Immutable.List(FLOW_ELEMENTS) }),
  guid: '',
};

function simplifyBody(body: Object) : Object {

  let arr = null;
  if (body['#array'] !== undefined) {
    arr = body['#array'];
  } else if (body instanceof Array) {
    arr = body;
  }

  if (arr !== null && arr.length === 1) {
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

  return { '#array': arr };

}

export class Choice extends Immutable.Record(defaultContent) {

  contentType: 'Choice';
  elementType: 'choice';
  value: string;
  color: string;
  body: ContentElements;
  guid: string;

  constructor(params?: ChoiceParams) {
    super(augment(params));
  }

  with(values: ChoiceParams) {
    return this.merge(values) as this;
  }

  static fromText(text: string, guid: string) : Choice {
    return new Choice().with({
      guid,
      body: ContentElements.fromText(text, '', Immutable.List(FLOW_ELEMENTS).toArray()),
    });
  }

  static fromPersistence(root: Object, guid: string) {

    const choice = (root as any).choice;
    let model = new Choice({ guid });

    if (Object.keys(choice).length === 1 && choice['@value'] !== undefined) {
      choice['#text'] = choice['@value'];
    }

    const body = ContentElements.fromPersistence(choice, '', FLOW_ELEMENTS);
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
