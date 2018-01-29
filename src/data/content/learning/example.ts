import * as Immutable from 'immutable';

import createGuid from '../../../utils/guid';
import { augment, getChildren } from '../common';
import { getKey } from '../../common';
import { Title } from '../learning/title';
import { BoxContent } from '../common/box';
import { Maybe } from 'tsmonad';

export type ExampleParams = {
  id?: Maybe<string>,
  title?: Title,
  purpose?: Maybe<string>,
  content?: BoxContent,
  guid?: string,
};

const defaultContent = {
  id: Maybe.nothing(),
  title: new Title(),
  purpose: Maybe.nothing(),
  content: new BoxContent(),
  guid: '',
};

export class Example extends Immutable.Record(defaultContent) {
  contentType: 'Example';
  id: Maybe<string>;
  title: Title;
  purpose: Maybe<string>;
  content: BoxContent;
  guid: string;

  constructor(params?: ExampleParams) {
    super(augment(params));
  }

  with(values: ExampleParams) {
    return this.merge(values) as this;
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

    model = model.with({ content: BoxContent.fromPersistence(getChildren(t), '') });

    return model;
  }

  toPersistence() : Object {
    const s = {
      example: {
        '#array': [
          this.title.toPersistence(),
          this.content.toPersistence(),
        ],
      },
    };

    this.id.lift(p => s.example['@id'] = p);
    this.purpose.lift(p => s.example['@purpose'] = p);

    return s;
  }
}
