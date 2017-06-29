import * as Immutable from 'immutable';
import * as contentTypes from '../contentTypes';
import guid from '../../utils/guid';
import { getKey } from '../common';
import { isNullOrUndefined, isArray } from 'util';
import * as types from '../types';

export type MediaModelParams = {
  webContent?: contentTypes.WebContent,
  guid?: string,
  type?: string
  name?: string,
  _attachments?: any,
  referencingDocuments?: Immutable.List<types.DocumentId>,
};
const defaultMediaModelParams = {
  modelType: 'MediaModel',
  webContent: new contentTypes.WebContent(),
  guid: '',
  type: 'x-oli-webcontent',
  name: '',
  _attachments: {},
  referencingDocuments: Immutable.List<types.DocumentId>(),
};

export class MediaModel extends Immutable.Record(defaultMediaModelParams) {

  modelType: 'MediaModel';
  webContent: contentTypes.WebContent;
  guid: string;
  type: string;
  name: string;

  // tslint:disable-next-line
  _attachments: any;


  referencingDocuments: Immutable.List<types.DocumentId>;

  constructor(params?: MediaModelParams) {
    params ? super(params) : super();
  }

  with(values: MediaModelParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(json: Object): MediaModel {
    let model = new MediaModel();
    const m = json as any;
    model = model.with({ webContent: contentTypes.WebContent.fromPersistence(m) });
    model = model.with({ guid: m.guid });
    model = model.with({ name: m.name });
    model = model.with({ _attachments: m._attachments });
    model = model.with(
      { referencingDocuments: Immutable.List<types.DocumentId>(m.referencingDocuments) });

    return model;
  }

  toPersistence(): Object {
    return {
      modelType: 'MediaModel',
      name: this.name,
      _attachments: this._attachments,
      referencingDocuments: this.referencingDocuments.toArray(),
    };
  }
}
