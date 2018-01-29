import * as Immutable from 'immutable';
import { augment, getChildren } from '../common';
import { LinkContent } from '../common/link';

export type ActivityLinkParams = {
  target?: string,
  idref?: string,
  purpose?: string,
  title?: string,
  content?: LinkContent,
  guid?: string,
};

const defaultContent = {
  contentType: 'ActivityLink',
  target: 'self',
  idref: '',
  purpose: 'checkpoint',
  title: '',
  content: new LinkContent(),
  guid: '',
};

export class ActivityLink extends Immutable.Record(defaultContent) {

  contentType: 'ActivityLink';
  content: LinkContent;
  target: string;
  idref: string;
  purpose: string;
  title: string;
  guid: string;

  constructor(params?: ActivityLinkParams) {
    super(augment(params));
  }

  with(values: ActivityLinkParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(root: Object, guid: string) : ActivityLink {

    const t = (root as any).activity_link;

    let model = new ActivityLink({ guid });

    if (t['@title'] !== undefined) {
      model = model.with({ title: t['@title'] });
    }
    if (t['@idref'] !== undefined) {
      model = model.with({ idref: t['@idref'] });
    }
    if (t['@target'] !== undefined) {
      model = model.with({ target: t['@target'] });
    }
    if (t['@purpose'] !== undefined) {
      model = model.with({ purpose: t['@purpose'] });
    }

    model = model.with({ content: LinkContent.fromPersistence(t, '') });

    return model;
  }

  toPersistence(toPersistence) : Object {
    return {
      activity_link: {
        '@title': this.title,
        '@idref': this.idref,
        '@target': this.target,
        '@purpose': this.purpose,
      },
    };
  }
}
