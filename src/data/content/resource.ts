import * as Immutable from 'immutable';
import { FileNode } from './file_node';
import { isNullOrUndefined } from 'util';

export type ResourceParams = {
  rev?: number,
  guid?: string,
  id?: string,
  type?: string,
  title?: string,
  dateCreated?: Date,
  dateUpdated?: Date,
  fileNode?: FileNode,
};

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

function convertHour(hour: number, isPM: boolean) : number {
  if (isPM) {
    return hour === 12 ? 12 : hour + 12;
  } else {
    return hour === 12 ? 0 : hour;
  }
}

function parseDate(value: string) : Date {
  
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

export class Resource extends Immutable.Record(
  {contentType: 'Resource',rev:0, guid: '', id: '', type: '', title: '',
    dateCreated: new Date(), dateUpdated: new Date(), fileNode: new FileNode()}) {
  
  contentType: 'Resource';
  rev: number;
  guid: string;
  id: string;
  type: string;
  title: string;
  dateCreated: Date;
  dateUpdated: Date;
  fileNode: FileNode;
  
  constructor(params?: ResourceParams) {
    params ? super(params) : super();
  }

  with(values: ResourceParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(root: Object) : Resource {
    const a = (root as any);
    const model = new Resource({
      rev: a.rev, 
      guid: a.guid, 
      id: a.id, 
      type: a.type, 
      title: a.title,
      dateCreated: a.dateCreated === undefined || a.dateCreate === null 
        ? new Date() : parseDate(a.dateCreated),
      dateUpdated: a.dateUpdated === undefined || a.dateUpdated === null 
        ? new Date() : parseDate(a.dateUpdated),
      fileNode: isNullOrUndefined(a.fileNode) 
        ? new FileNode() : FileNode.fromPersistence(a.fileNode),
    });
    
    return model;
  }

  toPersistence() : Object {
    return {
      rev: this.rev,
      guid: this.guid,
      id: this.id,
      type: this.type,
      title: this.title,
      dateCreated: JSON.stringify(this.dateCreated),
      dateUpdated: JSON.stringify(this.dateUpdated),
    };
  }
}
