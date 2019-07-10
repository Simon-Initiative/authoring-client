import * as Immutable from 'immutable';
import * as contentTypes from '../contentTypes';
import guid from '../../utils/guid';
import { getKey } from '../common';
import { LegacyTypes } from '../types';
import { ResourceGuid, ResourceId } from 'data/types';


export type LearningObjectivesModelParams = {
  resource?: contentTypes.Resource,
  guid?: ResourceGuid,
  lock?: contentTypes.Lock,
  id?: ResourceId,
  title?: string,
  objectives?: Immutable.OrderedMap<string, contentTypes.LearningObjective>,
};
const defaultLearningObjectivesModelParams = {
  modelType: 'LearningObjectivesModel',
  type: LegacyTypes.learning_objectives,
  resource: new contentTypes.Resource(),
  guid: ResourceGuid.of(''),
  id: ResourceId.of(''),
  lock: new contentTypes.Lock(),
  title: 'New LearningObjectives',
  objectives: Immutable.OrderedMap<string, contentTypes.LearningObjective>(),
};

export const DEFAULT_OBJECTIVE_TITLE = 'Default objective';

export class LearningObjectivesModel
  extends Immutable.Record(defaultLearningObjectivesModelParams) {

  modelType: 'LearningObjectivesModel';
  resource: contentTypes.Resource;
  type: string;
  guid: ResourceGuid;
  lock: contentTypes.Lock;
  id: ResourceId;
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
      guid: ResourceGuid.of(a.guid),
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
      model = model.with({ id: ResourceId.of(org['@id']) });
    }

    const objById = {};

    org['#array'].forEach((item) => {

      const key = getKey(item);
      const id = guid();

      switch (key) {
        case 'objective':
          const obj = contentTypes.LearningObjective.fromPersistence(item, id);
          objById[obj.id.value()] = obj;
          model = model.with({ objectives: model.objectives.set(obj.guid, obj) });
          break;
        case 'objective_skills':
          const objskills = contentTypes.ObjectiveSkills.fromPersistence(item, id);

          // Find the objective and update it's skills
          const o = objById[objskills.idref.value()];
          if (o !== undefined) {
            const updated = o.with({ skills: objskills.skills.toList() });
            model = model.with({ objectives: model.objectives.set(updated.guid, updated) });
          }

          break;
        default:

      }
    });

    return model;
  }

  toPersistence(): Object {
    const children: Object[] = [
      { title: { '#text': this.title } }];

    if (this.objectives.size === 0) {
      const id = guid();
      const o = new contentTypes.LearningObjective().with({
        title: DEFAULT_OBJECTIVE_TITLE,
        id: ResourceId.of(id),
      });
      children.push(o.toPersistence());
    } else {

      const objectiveSkills = [];

      // Create ephemeral ObjectiveSkill objects that contain the objective
      // skills and serialize them as separate elements in the data
      this.objectives.toArray().forEach((o) => {
        children.push(o.toPersistence());

        if (o.skills.size > 0) {
          objectiveSkills.push(
            (new contentTypes.ObjectiveSkills().with({
              idref: o.id,
              skills: o.skills.map(s => s.value()).toSet(),
            })).toPersistence());
        }
      });

      objectiveSkills.forEach(os => children.push(os));

    }



    const resource = this.resource.toPersistence();
    const doc = [{
      objectives: {
        '@id': this.resource.id.value(),
        '#array': children,
      },
    }];

    const root = {
      doc,
    };

    return Object.assign({}, resource, root, this.lock.toPersistence());
  }
}
