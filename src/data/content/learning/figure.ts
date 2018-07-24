import * as Immutable from 'immutable';
import createGuid from 'utils/guid';
import { augment, getChildren, except, ensureIdGuidPresent, setId } from 'data/content/common';
import { getKey } from 'data/common';
import { Title } from 'data/content/learning/title';
import { ContentElements, BOX_ELEMENTS } from 'data/content/common/elements';
import { Maybe } from 'tsmonad';
import { Caption } from 'data/content/learning/caption';
import { Cite } from 'data/content/learning/cite';
import { ContiguousText } from 'data/contentTypes';

export type FigureParams = {
  guid?: string,
  // core.attrs
  id?: string,
  // labeled.content
  title?: Title,
  caption?: Maybe<Caption>,
  cite?: Maybe<Cite>,
  // boxmodel
  content?: ContentElements,
};

const defaultContent = {
  contentType: 'Figure',
  elementType: 'figure',

  guid: '',
  id: '',
  title: Title.fromText('Title'),
  caption: Maybe.nothing(),
  cite: Maybe.nothing(),
  content: new ContentElements().with({ supportedElements: Immutable.List<string>(BOX_ELEMENTS) }),
};

export class Figure extends Immutable.Record(defaultContent) {
  contentType: 'Figure';
  elementType: 'figure';

  guid: string;
  id: string;
  title: Title;
  caption: Maybe<Caption>;
  cite: Maybe<Cite>;
  content: ContentElements;

  constructor(params?: FigureParams) {
    super(augment(params, true));
  }

  with(values: FigureParams) {
    return this.merge(values) as this;
  }

  clone(): Figure {
    return ensureIdGuidPresent(this.with({
      title: this.title.clone(),
      caption: this.caption.lift(c => c.clone()),
      cite: this.cite.lift(c => c.clone()),
      content: this.content.clone(),
    }));
  }

  static fromPersistence(root: Object, guid: string, notify: () => void): Figure {
    const t = (root as any).figure;

    let model = new Figure({ guid });

    model = setId(model, t, notify);

    if (t['@title'] !== undefined) {
      model = model.with({ title: t['@title'] });
    }

    getChildren(t).forEach((item) => {

      const key = getKey(item);
      const id = createGuid();

      switch (key) {
        case 'title':
          model = model.with({ title: Title.fromPersistence(item, id, notify) });
          break;
        case 'cite':
          model = model.with({ cite: Maybe.just(Cite.fromPersistence(item, id, notify)) });
          break;
        case 'caption':
          model = model.with({ caption: Maybe.just(Caption.fromPersistence(item, id, notify)) });
          break;
        default:
      }
    });

    model = model.with({
      content: ContentElements
        .fromPersistence(
          except(getChildren(t), 'title', 'caption', 'cite'), '', BOX_ELEMENTS, null, notify),
    });

    return model;
  }

  toPersistence(): Object {

    const children = [];
    (this.title.text.content.first() as ContiguousText)
      .extractPlainText()
      .lift(text => text !== '' && text !== 'Title'
        ? children.push(this.title.toPersistence())
        : undefined);
    this.cite.lift(cite => children.push(cite.toPersistence()));
    this.caption.lift(caption => children.push(caption.toPersistence()));

    const content = this.content.content.size === 0
      ? [{ p: { '#text': ' ' } }]
      : this.content.toPersistence();

    const s = {
      figure: {
        '@id': this.id ? this.id : createGuid(),
        '#array': [
          ...children,
          ...content,
        ],
      },
    };

    return s;
  }
}
