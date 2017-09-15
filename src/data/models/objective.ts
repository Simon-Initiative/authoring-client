import * as Immutable from 'immutable';
import * as contentTypes from '../contentTypes';
import guid from '../../utils/guid';
import { Maybe } from 'tsmonad';
import { getKey } from '../common';
import { LegacyTypes } from '../types';


export type LearningObjectivesModelParams = {
  resource?: contentTypes.Resource,
  guid?: string,
  lock?: contentTypes.Lock,
  id?: string,
  title?: string,
  objectives?: Immutable.OrderedMap<string, contentTypes.LearningObjective>,
};
const defaultLearningObjectivesModelParams = {
  modelType: 'LearningObjectivesModel',
  type: LegacyTypes.learning_objectives,
  resource: new contentTypes.Resource(),
  guid: '',
  id: '',
  lock: new contentTypes.Lock(),
  title: 'New LearningObjectives',
  objectives: Immutable.OrderedMap<string, contentTypes.LearningObjective>(),
};


export class LearningObjectivesModel 
  extends Immutable.Record(defaultLearningObjectivesModelParams) {

  modelType: 'LearningObjectivesModel';
  resource: contentTypes.Resource;
  type: string;
  guid: string;
  lock: contentTypes.Lock;
  id: string;
  title: string;
  objectives: Immutable.OrderedMap<string, contentTypes.LearningObjective>;

  constructor(params?: LearningObjectivesModelParams) {
    params ? super(params) : super();
  }

  with(values: LearningObjectivesModelParams): LearningObjectivesModel {
    return this.merge(values) as this;
  }

  static fromPersistence(json: Object): LearningObjectivesModel {

    let model = new LearningObjectivesModel();

    const a = (json as any);
    model = model.with({ 
      resource: contentTypes.Resource.fromPersistence(a),
      guid: a.guid,
      title: a.title,
    });

    if (a.lock !== undefined && a.lock !== null) {
      model = model.with({ lock: contentTypes.Lock.fromPersistence(a.lock) });
    }
    let org = null;
    if (a.doc instanceof Array) {
      org = a.doc[0].objectives;
    } else {
      org = a.doc.objectives;
    }

    if (org['@id'] !== undefined) {
      model = model.with({ id: org['@id'] });
    }

    org['#array'].forEach((item) => {

      const key = getKey(item);
      const id = guid();

      switch (key) {
        case 'objective':
          const obj = contentTypes.LearningObjective.fromPersistence(item, id);
          model = model.with({ objectives: model.objectives.set(obj.guid, obj) });
          break;
        default:
          
      }
    });

    return model;
  }

  toPersistence(): Object {
    const children : Object[] = [
      { title: { '#text': this.title } }];
    
    if (this.objectives.size === 0) {
      const id = guid();
      const o = new contentTypes.LearningObjective().with({
        title: 'Default objective',
        id,
      });
      children.push(o.toPersistence());
    } else {
      this.objectives.toArray().forEach(o => children.push(o.toPersistence()));
    }
    
    const resource = this.resource.toPersistence();
    const doc = [{
      objectives: {
        '@id': this.resource.id,
        '#array': children,
      },
    }];

    const root = {
      doc,
    };

    return Object.assign({}, resource, root, this.lock.toPersistence());
  }
}
