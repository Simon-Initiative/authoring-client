import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';
import { augment, getChildren } from '../common';
import { Image } from './image';
import { LinkTarget } from './common';

export type LinkParams = {
  target?: LinkTarget,
  href?: string,
  internal?: boolean,
  title?: string,
  content?: Maybe<Image>,
  guid?: string,
};

const defaultContent = {
  contentType: 'Link',
  elementType: 'link',
  target: LinkTarget.New,
  href: 'www.google.com',
  internal: false,
  title: '',
  content: Maybe.nothing<Image>(),
  guid: '',
};

export class Link extends Immutable.Record(defaultContent) {
  contentType: 'Link';
  elementType: 'link';
  content: Maybe<Image>;
  target: LinkTarget;
  href: string;
  internal: boolean;
  title: string;
  guid: string;

  constructor(params?: LinkParams) {
    super(augment(params));
  }

  with(values: LinkParams) {
    return this.merge(values) as this;
  }


  clone() : Link {
    return this.with({
      content: this.content.caseOf(
        { just: i => Maybe.just(i.clone()), nothing: () => Maybe.nothing<Image>() }),
    });
  }

  static fromPersistence(root: Object, guid: string) : Link {
    const t = (root as any).link;

    let model = new Link({ guid });

    if (t['@title'] !== undefined) {
      model = model.with({ title: t['@title'] });
    }
    if (t['@href'] !== undefined) {
      model = model.with({ href: t['@href'] });
    }
    if (t['@internal'] !== undefined) {
      model = model.with({ internal: t['@internal'] === 'true' });
    }
    if (t['@target'] !== undefined) {
      model = model.with({ target: t['@target'] });
    }

    const children = getChildren(t);

    if (children instanceof Array
      && children.length === 1 && (children[0] as any).image !== undefined) {
      model = model.with({ content: Maybe.just(Image.fromPersistence(children[0], '')) });
    }

    return model;
  }

  toPersistence() : Object {
    const link = {
      link: {
        '@title': this.title,
        '@href': this.href,
        '@target': this.target,
        '@internal': this.internal ? 'true' : 'false',
      },
    };

    const imageContent: Image = this.content.caseOf({
      just: c => [c.toPersistence()],
      nothing: () => undefined,
    });

    if (imageContent) {
      link.link['#array'] = imageContent;
    }

    return link;
  }
}
