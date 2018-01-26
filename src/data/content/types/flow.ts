import * as Immutable from 'immutable';
import { FlowElement, parseFlowContent } from './parser';
import { augment, getChildren } from '../common';

export type FlowContentParams = {
  content?: Immutable.OrderedMap<string, FlowElement>,
  guid?: string,
};

const defaultContent = {
  contentType: 'FlowContent',
  content: Immutable.OrderedMap<string, FlowElement>(),
  guid: '',
};

export class FlowContent extends Immutable.Record(defaultContent) {

  contentType: 'FlowContent';
  content: Immutable.OrderedMap<string, FlowElement>;
  guid: string;

  constructor(params?: FlowContentParams) {
    super(augment(params));
  }

  with(values: FlowContentParams) {
    return this.merge(values) as this;
  }

  clone(): FlowContent {
    return this.with({
      content: this.content.map(e => e.clone()).toOrderedMap(),
    });
  }

  static fromPersistence(root: Object, guid: string) : FlowContent {

    const content = parseFlowContent(root);
    return new FlowContent({ guid, content });
  }

  toPersistence() : Object {
    return this.content.toArray().map(e => e.toPersistence());
  }
}
