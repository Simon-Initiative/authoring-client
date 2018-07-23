import * as Immutable from 'immutable';

import createGuid from '../../../utils/guid';
import { augment, getChildren, except, ensureIdGuidPresent } from '../common';
import { getKey } from '../../common';
import { Title } from '../learning/title';
import { ContentElements, MATERIAL_ELEMENTS } from 'data/content/common/elements';

export type AlternativeParams = {
  title?: Title,
  content?: ContentElements,
  value?: string,
  guid?: string,
};

const defaultContent = {
  contentType: 'Alternative',
  elementType: 'alternative',
  title: new Title(),
  value: '',
  content: new ContentElements().with({ supportedElements: Immutable.List(MATERIAL_ELEMENTS) }),
  guid: '',
};

export class Alternative extends Immutable.Record(defaultContent) {
  contentType: 'Alternative';
  elementType: 'alternative';
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

  clone(): Alternative {
    return ensureIdGuidPresent(this.with({
      content: this.content.clone(),
      title: this.title.clone(),
    }));
  }

  static fromPersistence(root: Object, guid: string, notify: () => void): Alternative {
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
          model = model.with({ title: Title.fromPersistence(item, id, notify) });
          break;
        default:
      }
    });

    model = model.with({
      content: ContentElements
        .fromPersistence(except(getChildren(t), 'title'), '', MATERIAL_ELEMENTS, null, notify),
    });

    return model;
  }

  toPersistence(): Object {
    const content = this.content.content.size === 0
      ? [{ p: { '#text': 'Placeholder' } }]
      : this.content.toPersistence();

    const s = {
      alternative: {
        '@value': this.value,
        '#array': [
          this.title.toPersistence(),
          ...content,
        ],
      },
    };

    return s;
  }
}
