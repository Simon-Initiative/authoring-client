import * as Immutable from 'immutable';
import { FileNode } from './file_node';
import { isNullOrUndefined } from 'util';
import { LegacyTypes } from 'data/types';
import { parseDate } from 'utils/date';

export type ResourceParams = {
  rev?: number,
  guid?: string,
  id?: string,
  type?: LegacyTypes,
  title?: string,
  lastRevisionGuid?: string;
  previousRevisionGuid?: string;
  lastRevisionNumber?: string;
  dateCreated?: Date,
  dateUpdated?: Date,
  fileNode?: FileNode,
  resourceState?: ResourceState,
};

// Added to support soft resource deletion
export enum ResourceState {
  ACTIVE = 'ACTIVE',
  DELETED = 'DELETED',
  RESTORED = 'RESTORED',
}

export class Resource extends Immutable.Record(
  {
    contentType: 'Resource', rev: 0, guid: '', id: '', type: '', title: '',
    dateCreated: new Date(), dateUpdated: new Date(), fileNode: new FileNode(),
    lastRevisionGuid: '', lastRevisionNumber: '', previousRevisionGuid: '',
    resourceState: ResourceState.ACTIVE,
  }) {

  contentType: 'Resource';
  rev: number;
  guid: string;
  id: string;
  type: string;
  title: string;
  lastRevisionGuid: string;
  previousRevisionGuid: string;
  lastRevisionNumber: string;
  dateCreated: Date;
  dateUpdated: Date;
  fileNode: FileNode;
  resourceState: ResourceState;

  constructor(params?: ResourceParams) {
    params ? super(params) : super();
  }

  with(values: ResourceParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(root: Object): Resource {
    const a = (root as any);
    const model = new Resource({
      rev: a.rev,
      guid: a.guid,
      id: a.id,
      type: a.type,
      title: a.title || '',
      lastRevisionGuid: a.lastRevision !== undefined && a.lastRevision !== null
        ? a.lastRevision.guid : '',
      previousRevisionGuid: a.lastRevision !== undefined && a.lastRevision !== null
        ? a.lastRevision.previousRevision : '',
      lastRevisionNumber: a.lastRevision !== undefined && a.lastRevision !== null
        ? a.lastRevision.revisionNumber : '',
      dateCreated: a.dateCreated === undefined || a.dateCreate === null
        ? new Date() : parseDate(a.dateCreated),
      dateUpdated: a.dateUpdated === undefined || a.dateUpdated === null
        ? new Date() : parseDate(a.dateUpdated),
      fileNode: isNullOrUndefined(a.fileNode)
        ? new FileNode() : FileNode.fromPersistence(a.fileNode),
      resourceState: a.resourceState === undefined || a.resourceState === null
        ? ResourceState.ACTIVE : a.resourceState,
    });

    return model;
  }

  toPersistence(): Object {
    return {
      rev: this.rev,
      guid: this.guid,
      id: this.id,
      type: this.type,
      title: this.title,
      dateCreated: JSON.stringify(this.dateCreated),
      dateUpdated: JSON.stringify(this.dateUpdated),
      resourceState: this.resourceState,
    };
  }
}
