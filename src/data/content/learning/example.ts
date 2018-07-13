import * as Immutable from 'immutable';

import createGuid from '../../../utils/guid';
import { augment, getChildren, except } from '../common';
import { getKey } from '../../common';
import { Title } from '../learning/title';
import { ContentElements, BOX_ELEMENTS } from 'data/content/common/elements';
import { Maybe } from 'tsmonad';

export type ExampleParams = {
  id?: string,
  title?: Title,
  purpose?: Maybe<string>,
  content?: ContentElements,
  guid?: string,
};

const defaultContent = {
  contentType: 'Example',
  elementType: 'example',
  id: createGuid(),
  title: Title.fromText('Title'),
  purpose: Maybe.nothing(),
  content: new ContentElements().with({ supportedElements: Immutable.List<string>(BOX_ELEMENTS) }),
  guid: '',
};

export class Example extends Immutable.Record(defaultContent) {
  contentType: 'Example';
  elementType: 'example';
  id: string;
  title: Title;
  purpose: Maybe<string>;
  content: ContentElements;
  guid: string;

  constructor(params?: ExampleParams) {
    super(augment(params));
  }

  with(values: ExampleParams) {
    return this.merge(values) as this;
  }

  clone() : Example {
    return this.with({
      id: createGuid(),
      content: this.content.clone(),
    });
  }

  static fromPersistence(root: Object, guid: string) : Example {
    const t = (root as any).example;

    let model = new Example({ guid });

    if (t['@id']) {
      model = model.with({ id: t['@id'] });
    } else {
      model = model.with({ id: createGuid() });
    }
    if (t['@purpose'] !== undefined) {
      model = model.with({ purpose: Maybe.just(t['@purpose']) });
    }

    getChildren(t).forEach((item) => {

      const key = getKey(item);
      const id = createGuid();

      switch (key) {
        case 'title':
          model = model.with({ title: Title.fromPersistence(item, id) });
          break;
        default:
      }
    });

    model = model.with({ content: ContentElements
      .fromPersistence(except(getChildren(t), 'title'), '', BOX_ELEMENTS) });

    return model;
  }

  toPersistence() : Object {

    const content = this.content.content.size === 0
       ? [{ p: { '#text': ' ' } }]
       : this.content.toPersistence();

    const s = {
      example: {
        '@id': this.id,
        '#array': [
          this.title.toPersistence(),
          ...content,
        ],
      },
    };

    this.purpose.lift(p => s.example['@purpose'] = p);

    return s;
  }
}
