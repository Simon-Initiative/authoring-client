import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';
import { augment, getChildren, ensureIdGuidPresent } from 'data/content/common';
import { Image } from 'data/content/learning/image';

export type AnchorParams = {
  content?: Maybe<Image>,
  guid?: string,
};

const defaultContent = {
  contentType: 'Anchor',
  elementType: 'anchor',
  content: Maybe.nothing<Image>(),
  guid: '',
};

export class Anchor extends Immutable.Record(defaultContent) {
  contentType: 'Anchor';
  elementType: 'anchor';
  content: Maybe<Image>;
  guid: string;

  constructor(params?: AnchorParams) {
    super(augment(params));
  }

  with(values: AnchorParams) {
    return this.merge(values) as this;
  }


  clone(): Anchor {
    return ensureIdGuidPresent(this.with({
      content: this.content.lift(i => i.clone()),
    }));
  }

  static fromPersistence(root: Object, guid: string, notify: () => void): Anchor {
    const t = (root as any).anchor;

    let model = new Anchor({ guid });

    const children = getChildren(t);

    if (children instanceof Array
      && children.length === 1 && (children[0] as any).image !== undefined) {
      model = model.with({ content: Maybe.just(Image.fromPersistence(children[0], '', notify)) });
    }

    return model;
  }

  toPersistence(): Object {
    const anchor = {
      anchor: {
      },
    };

    const imageContent: Image = this.content.caseOf({
      just: c => [c.toPersistence()],
      nothing: () => undefined,
    });

    if (imageContent) {
      anchor.anchor['#array'] = imageContent;
    }

    return anchor;
  }
}
