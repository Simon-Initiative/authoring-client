import * as Immutable from 'immutable';
import * as contentTypes from '../contentTypes';
import guid from '../../utils/guid';
import { getKey } from '../common';
import { isNullOrUndefined, isArray } from 'util';

export type CourseModelParams = {
  rev?: number,
  guid?: string,
  id?: string,
  version?: string,
  title?: string,
  type?: string,
  description?: string,
  buildStatus?: string,
  metadata?: contentTypes.MetaData,
  options?: string,
  icon?: contentTypes.WebContent,
  resources?: Immutable.OrderedMap<string, contentTypes.Resource>,
  webContents?: Immutable.OrderedMap<string, contentTypes.WebContent>,
  developers?: Immutable.OrderedMap<string, contentTypes.UserInfo>,
};

const defaultCourseModel = {
  modelType: 'CourseModel',
  rev: 0,
  guid: '',
  id: '',
  version: '',
  type: 'x-oli-package',
  title: '',
  description: '',
  buildStatus: '',
  metadata: new contentTypes.MetaData(),
  options: '',
  icon: new contentTypes.WebContent(),
  resources: Immutable.OrderedMap<string, contentTypes.Resource>(),
  webContents: Immutable.OrderedMap<string, contentTypes.WebContent>(),
  developers: Immutable.OrderedMap<string, contentTypes.UserInfo>(),
};

export class CourseModel extends Immutable.Record(defaultCourseModel) {
  modelType: 'CourseModel';
  rev: number;
  guid: string;
  id: string;
  version: string;
  title: string;
  type: string;
  description: string;
  buildStatus: string;
  metadata: contentTypes.MetaData;
  options: string;
  icon: contentTypes.WebContent;
  resources: Immutable.OrderedMap<string, contentTypes.Resource>;
  webContents: Immutable.OrderedMap<string, contentTypes.WebContent>;
  developers: Immutable.OrderedMap<string, contentTypes.UserInfo>;

  constructor(params?: CourseModelParams) {
    params ? super(params) : super();
  }

  with(values: CourseModelParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(json: Object): CourseModel {
    let model = new CourseModel();
    const c = json as any;
    model = model.with({ rev: c.rev });
    model = model.with({ guid: c.guid });
    model = model.with({ id: c.id });
    model = model.with({ version: c.version });
    model = model.with({ title: c.title });
    model = model.with({ type: c.type });
    model = model.with({ description: c.description });
    model = model.with({ buildStatus: c.buildStatus });
    model = model.with({ options: JSON.stringify(c.options) });
    if (!isNullOrUndefined(c.metadata.jsonObject)) {
      model = model.with(
        { metadata: contentTypes.MetaData.fromPersistence(c.metadata.jsonObject) });
    }
    if (!isNullOrUndefined(c.icon)) {
      model = model.with({ icon: contentTypes.WebContent.fromPersistence(c.icon) });
    }
    if (!isNullOrUndefined(c.resources)) {
      c.resources.forEach((item) => {
        const id = item.guid;
        model = model.with(
          { resources: model.resources.set(id, contentTypes.Resource.fromPersistence(item)) });
      });
    }
    if (!isNullOrUndefined(c.webContents)) {
      c.webContents.forEach((item) => {
        const id = item.guid;
        model = model.with(
          { webContents: model.webContents.set(
            id, contentTypes.WebContent.fromPersistence(item)) });
      });
    }
    if (!isNullOrUndefined(c.developers)) {
      c.developers.forEach((item) => {
        const userName = item.userName;
        model = model.with(
          { developers: model.developers.set(
            userName, contentTypes.UserInfo.fromPersistence(item)) });
      });
    }
    return model;
  }

  toPersistence(): Object {
    const doc = [{
      package: {
        '@id': this.id,
        icon: this.icon.toPersistence(),
        title: this.title,
        '@version': this.version,
        metadata: this.metadata.toPersistence(),
        description: this.description,
        preferences: this.options,
      },
    }];
    const values = {
      modelType: 'CourseModel',
      guid: this.guid,
      id: this.id,
      version: this.version,
      title: this.title,
      type: this.type,
      description: this.description,
      doc,
    };
    return Object.assign({}, values);
  }
}
