import * as Immutable from 'immutable';
import { augment, getChildren } from '../common';
import { TextContent } from '../types/text';


export type AlternateParams = {
  title?: string,
  idref?: string,
  content?: TextContent,
  guid?: string,
};

const defaultContent = {
  contentType: 'Alternate',
  title: '',
  idref: '',
  content: new TextContent(),
  guid: '',
};

export class Alternate extends Immutable.Record(defaultContent) {

  contentType: 'Alternate';
  title: string;
  idref: string;
  content: TextContent;
  guid: string;

  constructor(params?: AlternateParams) {
    super(augment(params));
  }

  with(values: AlternateParams) {
    return this.merge(values) as this;
  }


  clone() : Alternate {
    return this.with({
      content: this.content.clone(),
    });
  }

  static fromPersistence(root: Object, guid: string) : Alternate {

    const t = (root as any).alternate;

    let model = new Alternate({ guid });

    if (t['@title'] !== undefined) {
      model = model.with({ title: t['@title'] });
    }
    if (t['@idref'] !== undefined) {
      model = model.with({ idref: t['@idref'] });
    }

    model = model.with({ content: TextContent.fromPersistence(getChildren(t), '') });

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
