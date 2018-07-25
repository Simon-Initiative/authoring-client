import * as Immutable from 'immutable';
import { augment, getChildren, except, ensureIdGuidPresent } from '../common';
import { ContentElements, TEXT_ELEMENTS } from 'data/content/common/elements';


export type AlternateParams = {
  title?: string,
  idref?: string,
  content?: ContentElements,
  guid?: string,
};

const defaultContent = {
  contentType: 'Alternate',
  elementType: 'alternate',
  title: '',
  idref: '',
  content: new ContentElements().with({ supportedElements: Immutable.List(TEXT_ELEMENTS) }),
  guid: '',
};

export class Alternate extends Immutable.Record(defaultContent) {

  contentType: 'Alternate';
  elementType: 'alternate';
  title: string;
  idref: string;
  content: ContentElements;
  guid: string;

  constructor(params?: AlternateParams) {
    super(augment(params));
  }

  with(values: AlternateParams) {
    return this.merge(values) as this;
  }


  clone() : Alternate {
    return ensureIdGuidPresent(this.with({
      content: this.content.clone(),
    }));
  }

  static fromPersistence(root: Object, guid: string, notify: () => void) : Alternate {

    const t = (root as any).alternate;

    let model = new Alternate({ guid });

    if (t['@title'] !== undefined) {
      model = model.with({ title: t['@title'] });
    }
    if (t['@idref'] !== undefined) {
      model = model.with({ idref: t['@idref'] });
    }

    model = model.with({ content: ContentElements
      .fromPersistence(except(getChildren(t), 'title'), '', TEXT_ELEMENTS, null, notify) });

    return model;
  }

  toPersistence() : Object {
    return {
      alternate: {
        '@title': this.title,
        '@idref': this.idref,
        '#array': this.content.toPersistence(),
      },
    };
  }
}
