import * as Immutable from 'immutable';
import { augment, getChildren, ensureIdGuidPresent } from '../common';
import { ContentElements, LINK_ELEMENTS } from 'data/content/common/elements';


export type XrefParams = {
  target?: string,
  idref?: string,
  page?: string,
  title?: string,
  content?: ContentElements,
  guid?: string,
};

const defaultContent = {
  contentType: 'Xref',
  elementType: 'xref',
  target: 'self',
  idref: '',
  page: '',
  title: '',
  content: new ContentElements().with({ supportedElements: Immutable.List(LINK_ELEMENTS) }),
  guid: '',
};

export class Xref extends Immutable.Record(defaultContent) {

  contentType: 'Xref';
  elementType: 'xref';
  content: ContentElements;
  target: string;
  idref: string;
  page: string;
  title: string;
  guid: string;

  constructor(params?: XrefParams) {
    super(augment(params));
  }

  with(values: XrefParams) {
    return this.merge(values) as this;
  }

  clone() : Xref {
    return ensureIdGuidPresent(this.with({
      content: this.content.clone(),
    }));
  }

  static fromPersistence(root: Object, guid: string, notify: () => void) : Xref {

    const t = (root as any).xref;

    let model = new Xref({ guid });

    if (t['@title'] !== undefined) {
      model = model.with({ title: t['@title'] });
    }
    if (t['@idref'] !== undefined) {
      model = model.with({ idref: t['@idref'] });
    }
    if (t['@target'] !== undefined) {
      model = model.with({ target: t['@target'] });
    }
    if (t['@page'] !== undefined) {
      model = model.with({ page: t['@page'] });
    }

    model = model.with({ content: ContentElements
      .fromPersistence(getChildren(t), '', LINK_ELEMENTS, null, notify) });

    return model;
  }

  toPersistence() : Object {
    return {
      xref: {
        '@title': this.title,
        '@idref': this.idref,
        '@target': this.target,
        '@page': this.page,
      },
    };
  }
}
