import * as Immutable from 'immutable';
import { augment, ensureIdGuidPresent } from '../common';
import { logger, LogTag } from 'utils/logger';
import { Numeric } from '../assessment/numeric';

export enum InputRefType {
  Numeric,
  Text,
  FillInTheBlank,
}

export type InputRefParams = {
  ordinal?: number,
  inputType?: InputRefType,
  input?: string,
  guid?: string,
};

const defaultContent = {
  contentType: 'InputRef',
  elementType: 'input_ref',
  ordinal: 0,
  inputType: Numeric,
  input: '',
  guid: '',
};

export class InputRef extends Immutable.Record(defaultContent) {

  contentType: 'InputRef';
  elementType: 'InputRef';
  ordinal: number;
  inputType: InputRefType;
  input: string;
  guid: string;

  constructor(params?: InputRefParams) {
    super(augment(params));
  }

  with(values: InputRefParams) {
    return this.merge(values) as this;
  }

  clone(): InputRef {
    return ensureIdGuidPresent(this);
  }

  static fromPersistence(root: Object, guid: string, notify: () => void): InputRef {

    const t = (root as any).input_ref;
    return new InputRef({ guid, input: t.input });
  }

  toPersistence(): Object {
    return {
      input_ref: {
        '@input': this.input,
      },
    };
  }
}
