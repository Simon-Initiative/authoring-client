import * as Immutable from 'immutable';

export type LockParams = {
  lockedBy?: string,
  lockedAt?: number 
};

export class Lock extends Immutable.Record({contentType: 'Lock', lockedBy: '', lockedAt: 0}) {
  
  contentType: 'Lock';
  lockedBy: string;
  lockedAt: number; 
  
  constructor(params?: LockParams) {
    params ? super(params) : super();
  }

  with(values: LockParams) {
    return this.merge(values) as this;
  }

  toPersistence() : Object {
    return {
      "lock": {
        "lockedBy": this.lockedBy,
        "lockedAt": this.lockedAt
      }
    }
  } 

  static fromPersistence(data: any) {
    return new Lock().with({ lockedBy: data.lockedBy, lockedAt: data.lockedAt });
  }
}
