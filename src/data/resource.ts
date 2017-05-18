import * as Immutable from 'immutable';

export type ResourceParams = {
  rev?: number,
  guid?: string,
  id?: string,
  type?: string,
  title?: string,
  dateCreated?: Date,
  dateUpdated?: Date
};

export class Resource extends Immutable.Record({contentType: 'Resource',rev:0, guid: '', id: '', type: '', title: '', dateCreated: new Date(), dateUpdated: new Date()}) {
  
  contentType: 'Resource';
  rev: number;
  guid: string;
  id: string;
  type: string;
  title: string;
  dateCreated: Date;
  dateUpdated: Date;
  
  constructor(params?: ResourceParams) {
    params ? super(params) : super();
  }

  with(values: ResourceParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(root: Object) : Resource {
    let a = (root as any);
    let model = new Resource({rev: a.rev, guid: a.guid, id: a.id, type: a.type, title: a.title});
    if(a.dateCreated){
      model = model.with({dateCreated : new Date(a.dateCreated)});
    }
    if(a.dateUpdated){
      model = model.with({dateUpdated: new Date(a.dateUpdated)});
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
