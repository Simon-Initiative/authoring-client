import * as Immutable from 'immutable';

export type MetaDataParams = {
  authors?: any,
  license?: string,
  copyright?: string,
  keywords?: string
};

export class MetaData extends Immutable.Record({contentType: 'MetaData',authors: '', license: '', copyright: '', keywords: ''}) {
  
  contentType: 'MetaData';
  authors: any;
  license: string;
  copyright: string;
  keywords: string;
  
  constructor(params?: MetaDataParams) {
    params ? super(params) : super();
  }

  with(values: MetaDataParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(root: Object) : MetaData {
    let a = (root as any);
    let model = new MetaData();
    if(a.authors){
      model = model.with({authors: a.authors});
    }
    if(a.license){
      model = model.with({license: a.license});
    }
    if(a.copyright){
      model = model.with({copyright: a.copyright});
    }
    if(a.keywords){
      model = model.with({keywords: a.keywords});
    }
    return model;
  }

  toPersistence() : Object {
    return {
      "authors": this.authors,
      "license": this.license,
      "copyright": this.copyright,
      "keywords": this.keywords
    }
  }
}
