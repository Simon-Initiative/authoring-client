import * as Immutable from 'immutable';
import { FileNode } from './file_node';
import { isNullOrUndefined } from 'util';
import { LegacyTypes, ResourceGuid, ResourceId } from 'data/types';

const monthsToOrdinal = {
  Jan: 0,
  Feb: 1,
  Mar: 2,
  Apr: 3,
  May: 4,
  Jun: 5,
  Jul: 6,
  Aug: 7,
  Sep: 8,
  Oct: 9,
  Nov: 10,
  Dec: 11,
};

function convertHour(hour: number, isPM: boolean): number {
  if (isPM) {
    return hour === 12 ? 12 : hour + 12;
  }

  return hour === 12 ? 0 : hour;
}

export function parseDate(value: string): Date {

  const p = value.split(' ');
  const t = p[3].split(':');

  return new Date(Date.UTC(
    parseInt(p[2], 10), monthsToOrdinal[p[0]],
    parseInt(p[1].substr(0, p[1].indexOf(',')), 10),
    convertHour(parseInt(t[0], 10), p[4] === 'PM'),
    parseInt(t[1], 10),
    parseInt(t[2], 10),
  ));
}

export type ResourceParams = {
  rev?: number,
  guid?: ResourceGuid,
  id?: ResourceId,
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
    contentType: 'Resource', rev: 0, guid: ResourceGuid.of(''),
    id: ResourceId.of(''), type: '', title: '',
    dateCreated: new Date(), dateUpdated: new Date(), fileNode: new FileNode(),
    lastRevisionGuid: '', lastRevisionNumber: '', previousRevisionGuid: '',
    resourceState: ResourceState.ACTIVE,
  }) {

  contentType: 'Resource';
  rev: number;
  guid: ResourceGuid;
  id: ResourceId;
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
      guid: ResourceGuid.of(a.guid),
      id: ResourceId.of(a.id),
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
      guid: this.guid.value(),
      id: this.id.value(),
      type: this.type,
      title: this.title,
      dateCreated: JSON.stringify(this.dateCreated),
      dateUpdated: JSON.stringify(this.dateUpdated),
      resourceState: this.resourceState,
    };
  }
}
