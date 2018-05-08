import * as Immutable from 'immutable';
import { ContiguousText, ContiguousTextMode } from 'data/content/learning/contiguous';
import { augment } from '../common';
import createGuid from 'utils/guid';

export const CONJUGATE_ELEMENTS = ['#text', 'em'];

export type ConjugateParams = {
  pronouns?: string,
  src?: string,
  type?: string,
  id?: string,
  content?: ContiguousText,
  guid?: string,
};

const defaultContent = {
  contentType: 'Conjugate',
  pronouns: '',
  src: '',
  type: '',
  id: '',
  content: ContiguousText.fromText('', '', ContiguousTextMode.SimpleText),
  guid: '',
};

export class Conjugate extends Immutable.Record(defaultContent) {

  contentType: 'Conjugate';
  pronouns: string;
  src: string;
  type: string;
  id: string;
  content: ContiguousText;
  guid: string;

  constructor(params?: ConjugateParams) {
    super(augment(params));
  }

  with(values: ConjugateParams) {
    return this.merge(values) as this;
  }

  clone() : Conjugate {
    return this.with({
      content: this.content.clone(),
    });
  }

  static fromPersistence(root: Object, guid: string) : Conjugate {

    const t = (root as any).conjugate;

    let model = new Conjugate({ guid });

    if (t['@id'] !== undefined) {
      model = model.with({ id: t['@id'] });
    }
    if (t['@pronouns'] !== undefined) {
      model = model.with({ pronouns: t['@pronouns'] });
    }
    if (t['@src'] !== undefined) {
      model = model.with({ src: t['@src'] });
    }
    if (t['@type'] !== undefined) {
      model = model.with({ type: t['@type'] });
    }

    model = model.with({ content: ContiguousText.fromPersistence(
      t, createGuid(), ContiguousTextMode.SimpleText) });

    return model;
  }

  toPersistence() : Object {

    return {
      conjugate: {
        '@id': this.id !== '' ? this.id : undefined,
        '@src': this.src !== '' ? this.src : undefined,
        '@type': this.type !== '' ? this.type : undefined,
        '@pronouns': this.pronouns !== '' ? this.pronouns : undefined,
        '#array': this.content.toPersistence(),
      },
    };
  }
}
