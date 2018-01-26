import * as Immutable from 'immutable';
import { augment, getChildren } from '../common';
import { LinkContent } from '../common/link';


export type XrefParams = {
  target?: string,
  idref?: string,
  page?: string,
  title?: string,
  content?: LinkContent,
  guid?: string,
};

const defaultContent = {
  contentType: 'Xref',
  target: 'self',
  idref: '',
  page: '',
  title: '',
  content: LinkContent,
  guid: '',
};

export class Xref extends Immutable.Record(defaultContent) {

  contentType: 'Xref';
  content: LinkContent;
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

  static fromPersistence(root: Object, guid: string, toDraft) : Xref {

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

    model = model.with({ content: LinkContent.fromPersistence(getChildren(t), '') });

    return model;
  }

  toPersistence(toPersistence) : Object {
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
