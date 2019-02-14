import * as Immutable from 'immutable';
import { augment, ensureIdGuidPresent, setId, getChildren } from '../common';
import { getKey } from 'data/common';
import createGuid from 'utils/guid';
import { Example } from './example';
import { Proof } from './proof';
import { Statement } from './statement';
import { Title } from './title';

export type ProofOrExample = Proof | Example;

export type TheoremParams = {
  statements?: Immutable.OrderedMap<string, Statement>,
  proofsOrExamples?: Immutable.OrderedMap<string, ProofOrExample>,
  id?: string,
  guid?: string,
  theoremType?: TheoremType,
  title?: Title,
};

export enum TheoremType {
  Axiom = 'axiom',
  Corollary = 'corollary',
  Hypothesis = 'hypothesis',
  Law = 'law',
  Lemma = 'lemma',
  Principle = 'principle',
  Proposition = 'proposition',
  Rule = 'rule',
  Theorem = 'theorem',
}

const defaultContent = {
  contentType: 'Theorem',
  elementType: 'theorem',
  id: '',
  statements: Immutable.OrderedMap<string, Statement>(),
  proofsOrExamples: Immutable.OrderedMap<string, ProofOrExample>(),
  theoremType: TheoremType.Theorem,
  title: Title.fromText(''),
  guid: '',
};


export class Theorem extends Immutable.Record(defaultContent) {

  contentType: 'Theorem';
  elementType: 'theorem';
  statements: Immutable.OrderedMap<string, Statement>;
  proofsOrExamples: Immutable.OrderedMap<string, ProofOrExample>;
  theoremType: TheoremType;
  title: Title;
  id: string;
  guid: string;

  constructor(params?: TheoremParams) {
    super(augment(params));
  }

  with(values: TheoremParams) {
    return this.merge(values) as this;
  }

  clone(): Theorem {
    return ensureIdGuidPresent(this.with({
      title: this.title.clone(),
      statements: this.statements.mapEntries(([_, v]) => {
        const clone: Statement = v.clone();
        return [clone.guid, clone];
      }).toOrderedMap() as Immutable.OrderedMap<string, Statement>,
      proofsOrExamples: this.proofsOrExamples.mapEntries(([_, v]) => {
        const clone: ProofOrExample = v.clone();
        return [clone.guid, clone];
      }).toOrderedMap() as Immutable.OrderedMap<string, ProofOrExample>,
    }));
  }

  static fromPersistence(root: Object, guid: string, notify: () => void): Theorem {

    const t = (root as any).theorem;

    let model = new Theorem({
      guid,
      theoremType: t['@type'],
    });

    model = setId(model, t, notify);

    getChildren(t).forEach((item) => {

      const key = getKey(item);
      const id = createGuid();

      switch (key) {
        case 'statement':
          const s = Statement.fromPersistence(item, id, notify);
          model = model.with({ statements: model.statements.set(s.guid, s) });

          break;
        case 'proof':
          const p = Proof.fromPersistence(item, id, notify);
          model = model.with({ proofsOrExamples: model.proofsOrExamples.set(p.guid, p) });

          break;
        case 'example':
          const e = Example.fromPersistence(item, id, notify);
          model = model.with({ proofsOrExamples: model.proofsOrExamples.set(e.guid, e) });

          break;
        case 'title':
          model = model.with(
            { title: Title.fromPersistence(item, id, notify) });
          break;
        default:

      }
    });

    return model;
  }

  toPersistence(): Object {

    const statements = this.statements.toArray().map(s => s.toPersistence());
    const proofsOrExamples = this.proofsOrExamples.toArray().map(p => p.toPersistence());
    const children = [this.title.toPersistence(), ...statements, ...proofsOrExamples];

    return {
      theorem: {
        '@id': this.id ? this.id : createGuid(),
        '@type': this.theoremType,
        '#array': children,
      },
    };
  }
}
