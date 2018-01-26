import * as Immutable from 'immutable';
import { MaterialElement, parseMaterialContent } from './parser';
import { augment, getChildren } from '../common';

export type MaterialContentParams = {
  content?: Immutable.OrderedMap<string, MaterialElement>,
  guid?: string,
};

const defaultContent = {
  contentType: 'MaterialContent',
  content: Immutable.OrderedMap<string, MaterialElement>(),
  guid: '',
};

export class MaterialContent extends Immutable.Record(defaultContent) {

  contentType: 'MaterialContent';
  content: Immutable.OrderedMap<string, MaterialElement>;
  guid: string;

  constructor(params?: MaterialContentParams) {
    super(augment(params));
  }

  with(values: MaterialContentParams) {
    return this.merge(values) as this;
  }

  clone(): MaterialContent {
    return this.with({
      content: this.content.map(e => e.clone()).toOrderedMap(),
    });
  }

  static fromPersistence(root: Object, guid: string) : MaterialContent {

    const content = parseMaterialContent(root);
    return new MaterialContent({ guid, content });
  }

  toPersistence() : Object {
    return this.content.toArray().map(e => e.toPersistence());
  }
}
