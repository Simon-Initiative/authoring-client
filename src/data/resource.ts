import * as Immutable from 'immutable';
import {FileNode} from "./fileNode";
import {isNullOrUndefined} from "util";

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

export class Resource extends Immutable.Record({contentType: 'Resource',rev:0, guid: '', id: '', type: '', title: '',
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
    let a = (root as any);
    let model = new Resource({rev: a.rev, guid: a.guid, id: a.id, type: a.type, title: a.title});
    if(!isNullOrUndefined(a.dateCreated)){
      model = model.with({dateCreated : new Date(a.dateCreated)});
    }
    if(!isNullOrUndefined(a.dateUpdated)){
      model = model.with({dateUpdated: new Date(a.dateUpdated)});
    }
    if(!isNullOrUndefined(a.fileNode)){
      model = model.with({fileNode: FileNode.fromPersistence(a.fileNode)});
    }
    
    return model;
  }

  toPersistence() : Object {
    return {
      "rev": this.rev,
      "guid": this.guid,
      "id": this.id,
      "type": this.type,
      "title": this.title,
      "dateCreated": JSON.stringify(this.dateCreated),
      "dateUpdated": JSON.stringify(this.dateUpdated)
    }
  }
}
