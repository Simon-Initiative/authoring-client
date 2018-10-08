import * as Immutable from 'immutable';
import * as contentTypes from '../contentTypes';
import { isNullOrUndefined } from 'util';
import { LegacyTypes } from '../types';
import { parseDate } from 'data/content/resource';

export enum DeploymentStatus {
  DEVELOPMENT = 'DEVELOPMENT',
  QA = 'QA',
  PRODUCTION = 'PRODUCTION',
  REQUESTING_PRODUCTION = 'REQUESTING_PRODUCTION',
}

export type CourseModelParams = {
  rev?: number,
  guid?: string,
  id?: string,
  version?: string,
  title?: string,
  type?: string,
  description?: string,
  buildStatus?: string,
  deploymentStatus?: DeploymentStatus,
  dateCreated?: Date,
  metadata?: contentTypes.MetaData,
  options?: string,
  icon?: contentTypes.WebContent,
  theme?: string,
  resources?: Immutable.OrderedMap<string, contentTypes.Resource>,
  resourcesById?: Immutable.OrderedMap<string, contentTypes.Resource>,
  webContents?: Immutable.OrderedMap<string, contentTypes.WebContent>,
  developers?: Immutable.OrderedMap<string, contentTypes.UserInfo>,
};

const defaultCourseModel = {
  modelType: 'CourseModel',
  rev: 0,
  guid: '',
  id: '',
  version: '',
  type: LegacyTypes.package,
  title: '',
  description: '',
  buildStatus: '',
  deploymentStatus: DeploymentStatus.DEVELOPMENT,
  dateCreated: Date.now(),
  metadata: new contentTypes.MetaData(),
  options: '',
  icon: new contentTypes.WebContent(),
  theme: '',
  resources: Immutable.OrderedMap<string, contentTypes.Resource>(),
  resourcesById: Immutable.OrderedMap<string, contentTypes.Resource>(),
  webContents: Immutable.OrderedMap<string, contentTypes.WebContent>(),
  developers: Immutable.OrderedMap<string, contentTypes.UserInfo>(),
};

function toKV(arr, deserialize) {
  return arr.reduce(
    (p, c) => {
      const obj = deserialize(c);
      const id = obj.guid;
      p[id] = obj;
      return p;
    },
    {},
  );
}

function buildResourceMap(params: CourseModelParams): CourseModelParams {

  if (params.resources !== undefined) {
    let map = Immutable.OrderedMap<string, contentTypes.Resource>();
    params.resources.forEach((value, key) => map = map.set(value.id, value));
    params.resourcesById = map;
  }
  return params;
}

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
  deploymentStatus: DeploymentStatus;
  dateCreated: Date;
  metadata: contentTypes.MetaData;
  options: string;
  icon: contentTypes.WebContent;
  theme: string;
  resources: Immutable.OrderedMap<string, contentTypes.Resource>;
  resourcesById: Immutable.OrderedMap<string, contentTypes.Resource>;
  webContents: Immutable.OrderedMap<string, contentTypes.WebContent>;
  developers: Immutable.OrderedMap<string, contentTypes.UserInfo>;

  constructor(params?: CourseModelParams) {
    params ? super(buildResourceMap(params)) : super();
  }

  with(values: CourseModelParams) {
    return this.merge(buildResourceMap(values)) as this;
  }

  static fromPersistence(json: Object): CourseModel {

    const c = json as any;

    const metadata =
      isNullOrUndefined(c.metadata.jsonObject)
        ? new contentTypes.MetaData()
        : contentTypes.MetaData.fromPersistence(c.metadata.jsonObject);

    const resources =
      isNullOrUndefined(c.resources)
        ? Immutable.OrderedMap<string, contentTypes.Resource>()
        : Immutable.OrderedMap<string, contentTypes.Resource>(
          toKV(c.resources, contentTypes.Resource.fromPersistence),
        );

    const webContents =
      isNullOrUndefined(c.webContents)
        ? Immutable.OrderedMap<string, contentTypes.WebContent>()
        : Immutable.OrderedMap<string, contentTypes.WebContent>(
          toKV(c.webContents, contentTypes.WebContent.fromPersistence),
        );

    let developers = Immutable.OrderedMap<string, contentTypes.UserInfo>();
    if (c.developers !== undefined && c.developers !== null) {
      c.developers.forEach((d) => {
        const deserialized = contentTypes.UserInfo.fromPersistence(d);
        developers = developers.set(deserialized.userName, deserialized);
      });
    }

    const model = new CourseModel({
      rev: c.rev,
      guid: c.guid,
      id: c.id,
      version: c.version,
      title: c.title,
      type: c.type,
      description: c.description,
      buildStatus: c.buildStatus,
      deploymentStatus: c.deploymentStatus,
      dateCreated: parseDate(c.dateCreated),
      options: JSON.stringify(c.options),
      icon: new contentTypes.WebContent(),
      theme: c.theme,
      metadata,
      resources,
      webContents,
      developers,
    });

    return model;
  }

  toPersistence(): Object {
    const doc = [{
      package: {
        '@id': this.id,
        icon: this.icon.toPersistence(),
        theme: this.theme,
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
      deploymentStatus: this.deploymentStatus,
      doc,
    };
    return Object.assign({}, values);
  }
}
