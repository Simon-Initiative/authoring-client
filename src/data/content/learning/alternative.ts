import * as Immutable from 'immutable';

import createGuid from '../../../utils/guid';
import { augment, getChildren } from '../common';
import { getKey } from '../../common';
import { Title } from '../learning/title';
import { ContentElements, MATERIAL_ELEMENTS } from 'data/content/common/elements';
import { Maybe } from 'tsmonad';
import { Alternate } from 'data/content/learning/alternate';

export type AlternativeParams = {
  title?: Title,
  content?: ContentElements,
  value?: string,
  guid?: string,
};

const defaultContent = {
  contentType: 'Alternative',
  title: new Title(),
  value: '',
  content: new ContentElements().with({ supportedElements: Immutable.List(MATERIAL_ELEMENTS) }),
  guid: '',
};

export class Alternative extends Immutable.Record(defaultContent) {
  contentType: 'Alternative';
  title: Title;
  value: string;
  content: ContentElements;
  guid: string;

  constructor(params?: AlternativeParams) {
    super(augment(params));
  }

  with(values: AlternativeParams) {
    return this.merge(values) as this;
  }



  clone() : Alternative {
    return this.with({
      content: this.content.clone(),
    });
  }

  static fromPersistence(root: Object, guid: string) : Alternative {
    const t = (root as any).alternative;

    let model = new Alternative({ guid });

    if (t['@value'] !== undefined) {
      model = model.with({ value: t['@value'] });
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
      .fromPersistence(getChildren(t), '', MATERIAL_ELEMENTS) });

    return model;
  }

  toPersistence() : Object {
    const s = {
      alternative: {
        '@value': this.value,
        '#array': [
          this.title.toPersistence(),
          ...this.content.toPersistence(),
        ],
      },
    };

    return s;
  }
}
