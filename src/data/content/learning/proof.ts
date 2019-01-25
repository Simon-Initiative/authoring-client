import * as Immutable from 'immutable';
import { augment, ensureIdGuidPresent, setId } from '../common';
import { ContentElements, MATERIAL_ELEMENTS } from 'data/content/common/elements';
import createGuid from 'utils/guid';

export type ProofParams = {
  content?: ContentElements,
  id?: string,
  guid?: string,
  tombstone?: Tombstone,
};

export enum Tombstone {
  None = 'none',
  BlackSquare = 'black-square',
  HollowBlackSquare = 'hollow-black-square',
  QED = 'qed',
  QEF = 'qef',
}

const defaultContent = {
  contentType: 'Proof',
  elementType: 'proof',
  id: '',
  content: new ContentElements().with({ supportedElements: Immutable.List(MATERIAL_ELEMENTS) }),
  tombstone: Tombstone.None,
  guid: '',
};


export class Proof extends Immutable.Record(defaultContent) {

  contentType: 'Proof';
  elementType: 'proof';
  content: ContentElements;
  tombstone: Tombstone;
  id: string;
  guid: string;

  constructor(params?: ProofParams) {
    super(augment(params));
  }

  with(values: ProofParams) {
    return this.merge(values) as this;
  }

  clone(): Proof {
    return ensureIdGuidPresent(this.with({
      content: this.content.clone(),
    }));
  }

  static fromPersistence(root: Object, guid: string, notify: () => void): Proof {

    const t = (root as any).proof;

    let model = new Proof({
      guid,
      content: ContentElements.fromPersistence(t, '', MATERIAL_ELEMENTS, null, notify),
    });

    model = setId(model, t, notify);

    if (t['@tombstone'] !== undefined) {
      model = model.with({ tombstone: t['@tombstone'] });
    }

    return model;
  }

  toPersistence(): Object {
    const t = {
      proof: {
        '@id': this.id ? this.id : createGuid(),
        '#array': this.content.toPersistence(),
      },
    };

    if (this.tombstone !== Tombstone.None) {
      t['proof']['@tombstone'] = this.tombstone;
    }

    return t;
  }
}
