import * as Immutable from 'immutable';
import { augment } from '../common';
import { ContentElements, TEXT_ELEMENTS } from 'data/content/common/elements';
import { LinkTarget } from './common';

export type ActivityLinkParams = {
  target?: LinkTarget,
  idref?: string,
  purpose?: string,
  title?: string,
  content?: ContentElements,
  guid?: string,
};

const defaultContent = {
  contentType: 'ActivityLink',
  elementType: 'activity_link',
  target: LinkTarget.New,
  idref: '',
  purpose: 'checkpoint',
  title: '',
  content: new ContentElements().with({ supportedElements: Immutable.List(TEXT_ELEMENTS) }),
  guid: '',
};

export class ActivityLink extends Immutable.Record(defaultContent) {

  contentType: 'ActivityLink';
  elementType: 'activity_link';
  content: ContentElements;
  target: LinkTarget;
  idref: string;
  purpose: string;
  title: string;
  guid: string;

  constructor(params?: ActivityLinkParams) {
    super(augment(params));
  }


  clone() : ActivityLink {
    return this.with({
      content: this.content.clone(),
    });
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

    model = model.with({ content: ContentElements.fromPersistence(t, '', TEXT_ELEMENTS) });

    return model;
  }

  toPersistence() : Object {
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
