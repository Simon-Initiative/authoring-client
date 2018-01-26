import * as Immutable from 'immutable';
import { BodyElement, parseBodyContent } from './parser';
import { augment, getChildren } from '../common';

export type BodyContentParams = {
  content?: Immutable.OrderedMap<string, BodyElement>,
  guid?: string,
};

const defaultContent = {
  contentType: 'BodyContent',
  content: Immutable.OrderedMap<string, BodyElement>(),
  guid: '',
};

export class BodyContent extends Immutable.Record(defaultContent) {

  contentType: 'BodyContent';
  content: Immutable.OrderedMap<string, BodyElement>;
  guid: string;

  constructor(params?: BodyContentParams) {
    super(augment(params));
  }

  with(values: BodyContentParams) {
    return this.merge(values) as this;
  }

  clone(): BodyContent {
    return this.with({
      content: this.content.map(e => e.clone()).toOrderedMap(),
    });
  }

  static fromPersistence(root: Object, guid: string) : BodyContent {

    const content = parseBodyContent(root);
    return new BodyContent({ guid, content });
  }

  toPersistence() : Object {
    return this.content.toArray().map(e => e.toPersistence());
  }
}
