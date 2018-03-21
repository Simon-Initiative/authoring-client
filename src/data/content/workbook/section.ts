import * as Immutable from 'immutable';

import createGuid from '../../../utils/guid';
import { augment, getChildren } from '../common';
import { getKey } from '../../common';
import { Title } from '../learning/title';

import { ContentElements, BODY_ELEMENTS } from 'data/content/common/elements';
import { Maybe } from 'tsmonad';
import { WB_BODY_EXTENSIONS } from 'data/content/workbook/types';
import { PurposeType } from 'data/content/learning/common';

export type SectionParams = {
  id?: Maybe<string>,
  title?: Title,
  purpose?: Maybe<PurposeType>,
  body?: ContentElements,
  guid?: string,
};

const defaultContent = {
  id: Maybe.nothing(),
  title: Title.fromText('New Section Title'),
  purpose: Maybe.nothing(),
  body: ContentElements.fromText('', '', [...BODY_ELEMENTS, ...WB_BODY_EXTENSIONS]),
  guid: '',
  contentType: 'Section',
};

export class Section extends Immutable.Record(defaultContent) {
  contentType: 'Section';
  id: Maybe<string>;
  title: Title;
  purpose: Maybe<string>;
  body: ContentElements;
  guid: string;

  constructor(params?: SectionParams) {
    super(augment(params));
  }

  with(values: SectionParams) {
    return this.merge(values) as this;
  }

  clone(): Section {
    return this.with({
      title: this.title.clone(),
      body: this.body.clone(),
    });
  }

  static fromPersistence(root: Object, guid: string) : Section {
    const t = (root as any).section;

    let model = new Section({ guid });

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
        case 'body':
          model = model.with({ body: ContentElements
            .fromPersistence(item['body'], id, [...BODY_ELEMENTS, ...WB_BODY_EXTENSIONS]) });
          break;
        default:
      }
    });

    return model;
  }

  toPersistence() : Object {
    const s = {
      section: {
        '#array': [
          this.title.toPersistence(),
          {
            body: {
              '#array': this.body.toPersistence(),
            },
          },
        ],
      },
    };

    this.id.lift(p => s.section['@id'] = p);
    this.purpose.lift(p => s.section['@purpose'] = p);

    return s;
  }
}
