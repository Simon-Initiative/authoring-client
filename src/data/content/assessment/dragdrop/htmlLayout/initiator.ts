import * as Immutable from 'immutable';
import { augment } from 'data/content/common';

export type InitiatorParams = {
  guid?: string;
  inputVal?: string;
  text?: string;
};

const defaultContent = {
  contentType: 'Initiator',
  elementType: 'initiator',
  guid: '',
  inputVal: '',
  text: '',
};

export class Initiator extends Immutable.Record(defaultContent) {

  contentType: 'Initiator';
  elementType: 'initiator';
  guid: string;
  inputVal: string;
  text: string;

  constructor(params?: InitiatorParams) {
    super(augment(params));
  }

  with(values: InitiatorParams) {
    return this.merge(values) as this;
  }

  clone() {
    return this;
  }

  static fromPersistence(initiatorEl: Element, guid: string): Initiator {
    const model = new Initiator({
      guid,
      text: initiatorEl.innerHTML,
      inputVal: initiatorEl.getAttribute('input_val'),
    });

    return model;
  }

  toPersistence() : string {
    return `<div input_val="${this.inputVal}" class="dnd-initiator">${this.text}</div>`;
  }
}
