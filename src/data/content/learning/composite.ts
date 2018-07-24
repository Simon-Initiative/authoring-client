import * as Immutable from 'immutable';
import createGuid from 'utils/guid';
import { augment, getChildren, except, ensureIdGuidPresent, setId } from 'data/content/common';
import { getKey } from 'data/common';
import { Title } from 'data/content/learning/title';
import { ContentElements, BOX_ELEMENTS } from 'data/content/common/elements';
import { Maybe } from 'tsmonad';
import { Instructions } from 'data/content/learning/instructions';

export type CompositeParams = {
  id?: string,
  title?: Maybe<Title>,
  purpose?: Maybe<string>,
  instructions?: Maybe<Instructions>,
  content?: ContentElements,
  guid?: string,
};

const defaultContent = {
  contentType: 'Composite',
  elementType: 'composite',
  id: '',
  title: Maybe.nothing(),
  purpose: Maybe.nothing(),
  instructions: Maybe.nothing(),
  content: new ContentElements().with({ supportedElements: Immutable.List<string>(BOX_ELEMENTS) }),
  guid: '',
};

export class Composite extends Immutable.Record(defaultContent) {
  contentType: 'Composite';
  elementType: 'composite';
  id: string;
  title: Maybe<Title>;
  purpose: Maybe<string>;
  instructions: Maybe<Instructions>;
  content: ContentElements;
  guid: string;

  constructor(params?: CompositeParams) {
    super(augment(params, true));
  }

  with(values: CompositeParams) {
    return this.merge(values) as this;
  }

  clone(): Composite {
    return ensureIdGuidPresent(this.with({
      content: this.content.clone(),
      title: this.title.lift(t => t.clone()),
      instructions: this.instructions.lift(i => i.clone()),
    }));
  }

  static fromPersistence(root: Object, guid: string, notify: () => void): Composite {
    const t = (root as any).composite_activity;

    let model = new Composite({ guid });

    model = setId(model, t, notify);

    if (t['@purpose'] !== undefined) {
      model = model.with({ purpose: Maybe.just(t['@purpose']) });
    }

    getChildren(t).forEach((item) => {

      const key = getKey(item);
      const id = createGuid();

      switch (key) {
        case 'title':
          model = model.with({ title: Maybe.just(Title.fromPersistence(item, id, notify)) });
          break;
        case 'instructions':
          model = model.with({
            instructions: Maybe.just(Instructions.fromPersistence(item, id, notify)),
          });
          break;
        default:
      }
    });

    model = model.with({
      content: ContentElements
        .fromPersistence(
          except(getChildren(t), 'title', 'instructions'), '', BOX_ELEMENTS, null, notify),
    });

    return model;
  }

  toPersistence(): Object {

    const optional = [];

    this.title.lift(title => optional.push(title.toPersistence()));
    this.instructions.lift(i => optional.push(i.toPersistence()));

    const encoded = this.content.toPersistence();
    const required = encoded.length === 0 ? [{
      p: {
        '#text': ' ',
        '@id': createGuid(),
      },
    }] : encoded;

    const s = {
      composite_activity: {
        '@id': this.id ? this.id : createGuid(),
        '#array': [...optional, ...required],
      },
    };
    this.purpose.lift(p => s.composite_activity['@purpose'] = p);

    return s;
  }
}
