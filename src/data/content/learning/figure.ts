import * as Immutable from 'immutable';

import createGuid from '../../../utils/guid';
import { augment, getChildren, except } from '../common';
import { getKey } from '../../common';
import { Title } from '../learning/title';
import { ContentElements, BOX_ELEMENTS } from 'data/content/common/elements';
import { Maybe } from 'tsmonad';
import { Caption } from './caption';
import { Cite } from './cite';

export type FigureParams = {
  guid?: string,
  // core.attrs
  id?: Maybe<string>,
  // labeled.content
  title?: Maybe<Title>,
  caption?: Maybe<Caption>,
  cite?: Maybe<Cite>,
  // boxmodel
  content?: ContentElements,
};

const defaultContent = {
  contentType: 'Figure',

  guid: '',
  id: Maybe.nothing(),
  title: Maybe.nothing(),
  caption: Maybe.nothing(),
  cite: Maybe.nothing(),
  content: ContentElements.fromText('Content', '', BOX_ELEMENTS),
};

export class Figure extends Immutable.Record(defaultContent) {
  contentType: 'Figure';

  guid: string;
  id: Maybe<string>;
  title: Maybe<Title>;
  caption: Maybe<Caption>;
  cite: Maybe<Cite>;
  content: ContentElements;

  constructor(params?: FigureParams) {
    super(augment(params));
  }

  with(values: FigureParams) {
    return this.merge(values) as this;
  }

  clone(): Figure {
    return this.with({
      guid: createGuid(),
      id: Maybe.nothing(),
      title: this.title.caseOf({
        just: title => Maybe.just(title.clone()),
        nothing: () => Maybe.nothing() as Maybe<Title>,
      }),
      caption: this.caption.caseOf({
        just: caption => Maybe.just(caption.clone()),
        nothing: () => Maybe.nothing() as Maybe<Caption>,
      }),
      cite: this.cite.caseOf({
        just: cite => Maybe.just(cite.clone()),
        nothing: () => Maybe.nothing()as Maybe<Cite>,
      }),
      content: this.content.clone(),
    });
  }

  static fromPersistence(root: Object, guid: string): Figure {
    const t = (root as any).figure;

    let model = new Figure({ guid });

    if (t['@id'] !== undefined) {
      model = model.with({ id: Maybe.just(t['@id']) });
    }
    if (t['@title'] !== undefined) {
      model = model.with({ title: Maybe.just(t['@title']) });
    }

    getChildren(t).forEach((item) => {

      const key = getKey(item);
      const id = createGuid();

      switch (key) {
        case 'title':
          model = model.with({ title: Maybe.just(Title.fromPersistence(item, id)) });
          break;
        case 'caption':
          model = model.with({ caption: Maybe.just(Caption.fromPersistence(item, id)) });
          break;
        case 'cite':
          model = model.with({ cite: Maybe.just(Cite.fromPersistence(item, id)) });
          break;
        default:
      }
    });

    model = model.with({
      content: ContentElements
        .fromPersistence(except(getChildren(t), 'title', 'caption', 'cite'), '', BOX_ELEMENTS),
    });

    return model;
  }

  toPersistence(): Object {

    const children = [];
    this.title.lift(title => children.push(title.toPersistence()));
    this.caption.lift(caption => children.push(caption.toPersistence()));
    this.cite.lift(cite => children.push(cite.toPersistence()));

    const content = this.content.content.size === 0
      ? [{ p: { '#text': ' ' } }]
      : this.content.toPersistence();

    const s = {
      figure: {
        '#array': [
          ...children,
          ...content,
        ],
      },
    };

    this.id.lift(p => s.figure['@id'] = p);

    return s;
  }
}
