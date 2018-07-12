import * as Immutable from 'immutable';
import * as contentTypes from 'data/contentTypes';
import guid from 'utils/guid';
import { Maybe } from 'tsmonad';
import { getKey } from 'data/common';

import { LegacyTypes } from 'data/types';

export type OrganizationModelParams = {
  resource?: contentTypes.Resource,
  guid?: string,
  type?: string;
  lock?: contentTypes.Lock,
  id?: string;
  version?: string;
  product?: Maybe<string>;
  title?: string;
  description?: string;
  metadata?: Object;
  audience?: string;
  icon?: Maybe<contentTypes.Icon>;
  preferenceValues?: Maybe<Object>;
  labels?: contentTypes.Labels;
  sequences?: contentTypes.Sequences;
};
const defaultOrganizationModelParams = {
  modelType: 'OrganizationModel',
  type: LegacyTypes.organization,
  resource: new contentTypes.Resource(),
  guid: '',
  id: '',
  version: '',
  product: Maybe.nothing<string>(),
  lock: new contentTypes.Lock(),
  title: 'New Organization',
  description: '',
  metadata: Maybe.nothing<Object>(),
  audience: '',
  icon: Maybe.nothing<contentTypes.Icon>(),
  preferenceValues: Maybe.nothing<Object>(),
  labels: new contentTypes.Labels(),
  sequences: new contentTypes.Sequences(),
};


export class OrganizationModel extends Immutable.Record(defaultOrganizationModelParams) {

  modelType: 'OrganizationModel';
  resource: contentTypes.Resource;
  guid: string;
  type: string;
  lock: contentTypes.Lock;
  id: string;
  version: string;
  product: Maybe<string>;
  title: string;
  description: string;
  metadata: Maybe<Object>;
  audience: string;
  icon: Maybe<contentTypes.Icon>;
  preferenceValues: Maybe<Object>;
  labels: contentTypes.Labels;
  sequences: contentTypes.Sequences;

  constructor(params?: OrganizationModelParams) {
    params ? super(params) : super();
  }

  with(values: OrganizationModelParams): OrganizationModel {
    return this.merge(values) as this;
  }

  static fromPersistence(json: Object): OrganizationModel {

    let model = new OrganizationModel();

    const a = (json as any);
    model = model.with({
      resource: contentTypes.Resource.fromPersistence(a),
      guid: a.guid,
      type: a.type,
      title: a.title,
    });

    if (a.lock !== undefined && a.lock !== null) {
      model = model.with({ lock: contentTypes.Lock.fromPersistence(a.lock) });
    }
    let org = null;
    if (a.doc instanceof Array) {
      org = a.doc[0].organization;
    } else {
      org = a.doc.organization;
    }

    if (org['@id'] !== undefined) {
      model = model.with({ id: org['@id'] });
    }
    if (org['@version'] !== undefined) {
      model = model.with({ version: org['@version'] });
    }
    if (org['@product'] !== undefined) {
      model = model.with({ product: Maybe.just(org['@product']) });
    }

    org['#array'].forEach((item) => {

      const key = getKey(item);
      const id = guid();

      switch (key) {
        case 'description':
          model = model.with(
            { description: item['description']['#text'] });
          break;
        case 'metadata:metadata':
          model = model.with(
            { metadata: Maybe.just(item) });
          break;
        case 'audience':
          model = model.with(
            { audience: item['audience']['#text'] });
          break;
        case 'pref:preference_values':
          model = model.with(
            { preferenceValues: Maybe.just(item) });
          break;
        case 'icon':
          model = model.with({ icon: Maybe.just(contentTypes.Icon.fromPersistence(item, id)) });
          break;
        case 'labels':
          model = model.with({ labels: contentTypes.Labels.fromPersistence(item, id) });
          break;
        case 'sequences':
          model = model.with({ sequences: contentTypes.Sequences.fromPersistence(item, id) });
          break;
        default:

      }
    });

    return model;
  }

  toPersistence(): Object {
    const children : Object[] = [
      { title: { '#text': this.title } },
      { description: { '#text': this.description } }];

    this.metadata.lift(m => children.push(m as any));
    children.push(({ audience: { '#text': this.audience } } as any));
    this.icon.lift(i => children.push(i.toPersistence()));
    this.preferenceValues.lift(p => children.push(p));
    children.push(this.labels.toPersistence());
    children.push(this.sequences.toPersistence());

    const resource = this.resource.toPersistence();
    const doc = [{
      organization: {
        '@id': this.resource.id,
        '@version': this.version,
        '#array': children,
      },
    }];

    this.product.lift(p => doc[0].organization['@product'] = p);

    const root = {
      doc,
    };

    return Object.assign({}, resource, root, this.lock.toPersistence());
  }
}
