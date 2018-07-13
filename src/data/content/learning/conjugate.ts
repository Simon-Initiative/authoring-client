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
  elementType: 'conjugate',
  pronouns: '',
  src: '',
  type: '',
  id: createGuid(),
  content: ContiguousText.fromText('', '', ContiguousTextMode.SimpleText),
  guid: '',
};

export class Conjugate extends Immutable.Record(defaultContent) {

  contentType: 'Conjugate';
  elementType: 'conjugate';
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
      id: createGuid(),
      content: this.content.clone(),
    });
  }

  static fromPersistence(root: Object, guid: string) : Conjugate {

    const t = (root as any).conjugate;

    let model = new Conjugate({ guid });

    if (t['@id']) {
      model = model.with({ id: t['@id'] });
    } else {
      model = model.with({ id: createGuid() });
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
        '@id': this.id,
        '@src': this.src !== '' ? this.src : undefined,
        '@type': this.type !== '' ? this.type : undefined,
        '@pronouns': this.pronouns !== '' ? this.pronouns : undefined,
        '#array': this.content.toPersistence(),
      },
    };
  }
}
