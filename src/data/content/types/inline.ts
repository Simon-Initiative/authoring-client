import * as Immutable from 'immutable';
import { InlineElement, parseInlineContent } from './parser';
import { augment, getChildren } from '../common';

export type InlineContentParams = {
  content?: Immutable.OrderedMap<string, InlineElement>,
  guid?: string,
};

const defaultContent = {
  contentType: 'InlineContent',
  content: Immutable.OrderedMap<string, InlineElement>(),
  guid: '',
};

export class InlineContent extends Immutable.Record(defaultContent) {

  contentType: 'InlineContent';
  content: Immutable.OrderedMap<string, InlineElement>;
  guid: string;

  constructor(params?: InlineContentParams) {
    super(augment(params));
  }

  with(values: InlineContentParams) {
    return this.merge(values) as this;
  }

  clone(): InlineContent {
    return this.with({
      content: this.content.map(e => e.clone()).toOrderedMap(),
    });
  }

  static fromPersistence(root: Object, guid: string) : InlineContent {

    const content = parseInlineContent(root);
    return new InlineContent({ guid, content });
  }

  toPersistence() : Object {
    return this.content.toArray().map(e => e.toPersistence());
  }
}
