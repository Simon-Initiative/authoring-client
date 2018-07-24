import * as Immutable from 'immutable';
import createGuid from 'utils/guid';
import { augment, getChildren, ensureIdGuidPresent, setId } from 'data/content/common';
import { getKey } from 'data/common';
import { Title } from 'data/content/learning/title';
import { ContentElements, BODY_ELEMENTS } from 'data/content/common/elements';
import { Maybe } from 'tsmonad';
import { WB_BODY_EXTENSIONS } from 'data/content/workbook/types';
import { PurposeType } from 'data/content/learning/common';

export type SectionParams = {
  id?: string,
  title?: Title,
  purpose?: Maybe<PurposeType>,
  body?: ContentElements,
  guid?: string,
};

const defaultContent = {
  contentType: 'Section',
  elementType: 'section',
  id:'',
  title: Title.fromText('New Section Title'),
  purpose: Maybe.nothing(),
  body: new ContentElements().with({ supportedElements: Immutable.List<string>(BODY_ELEMENTS) }),
  guid: '',
};

export class Section extends Immutable.Record(defaultContent) {
  contentType: 'Section';
  elementType: 'section';
  id: string;
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
    return ensureIdGuidPresent(this.with({
      title: this.title.clone(),
      body: this.body.clone(),
    }));
  }

  static fromPersistence(root: Object, guid: string, notify: () => void): Section {
    const t = (root as any).section;

    let model = new Section({ guid });

    model = setId(model, t, notify);

    if (t['@purpose'] !== undefined) {
      model = model.with({ purpose: Maybe.just(t['@purpose']) });
    }

    getChildren(t).forEach((item) => {

      const key = getKey(item);
      const id = createGuid();

      switch (key) {
        case 'title':
          model = model.with({ title: Title.fromPersistence(item, id, notify) });
          break;
        case 'body':
          model = model.with({
            body: ContentElements.fromPersistence(
              item['body'], id, [...BODY_ELEMENTS, ...WB_BODY_EXTENSIONS], null, notify),
          });
          break;
        default:
      }
    });

    return model;
  }

  toPersistence(): Object {

    const encoded = this.body.toPersistence();
    const content = encoded.length === 0 ? [{
      p: {
        '#text': ' ',
        '@id': createGuid(),
      },
    }] : encoded;

    const s = {
      section: {
        '@id': this.id || createGuid(),
        '#array': [
          this.title.toPersistence(),
          {
            body: {
              '#array': content,
            },
          },
        ],
      },
    };

    this.purpose.lift(p => s.section['@purpose'] = p);

    return s;
  }
}
