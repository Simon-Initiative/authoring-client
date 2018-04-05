import * as Immutable from 'immutable';

import createGuid from '../../../utils/guid';
import { augment, getChildren, except } from '../common';
import { getKey } from '../../common';
import { Title } from '../learning/title';
import { ContentElements, BOX_ELEMENTS } from 'data/content/common/elements';
import { Maybe } from 'tsmonad';

export type ExampleParams = {
  id?: Maybe<string>,
  title?: Title,
  purpose?: Maybe<string>,
  content?: ContentElements,
  guid?: string,
};

const defaultContent = {
  contentType: 'Example',
  id: Maybe.nothing(),
  title: Title.fromText('Title'),
  purpose: Maybe.nothing(),
  content: ContentElements.fromText('Content', '', BOX_ELEMENTS),
  guid: '',
};

export class Example extends Immutable.Record(defaultContent) {
  contentType: 'Example';
  id: Maybe<string>;
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
      content: this.content.clone(),
    });
  }

  static fromPersistence(root: Object, guid: string) : Example {
    const t = (root as any).example;

    let model = new Example({ guid });

    if (t['@id'] !== undefined) {
      model = model.with({ id: Maybe.just(t['@id']) });
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
        '#array': [
          this.title.toPersistence(),
          content,
        ],
      },
    };

    this.id.lift(p => s.example['@id'] = p);
    this.purpose.lift(p => s.example['@purpose'] = p);

    return s;
  }
}
