import * as Immutable from 'immutable';
import { augment } from '../../common';

export type InitiatorParams = {
  guid?: string;
  assessmentId?: string;
  fontWeight?: string;
  fontSize?: string;
  fontStyle?: string;
  textDecoration?: string;
  text?: string;
};

const defaultContent = {
  contentType: 'Initiator',
  elementType: 'initiator',
  guid: '',
  assessmentId: '',
  fontWeight: 'normal',
  fontSize: '12',
  fontStyle: 'normal',
  textDecoration: 'none',
  text: '',
};

export class Initiator extends Immutable.Record(defaultContent) {

  contentType: 'Initiator';
  elementType: 'initiator';
  guid: string;
  assessmentId: string;
  fontWeight: string;
  fontSize: string;
  fontStyle: string;
  textDecoration: string;
  text: string;

  constructor(params?: InitiatorParams) {
    super(augment(params));
  }

  with(values: InitiatorParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(json: Object, guid: string) : Initiator {

    const q = (json as any).initiator;
    let model = new Initiator({ guid });

    if (q['@assessmentId'] !== undefined) {
      model = model.with({ assessmentId: q['@assessmentId'] });
    }

    if (q['span'] !== undefined) {
      if (q['span']['@fontSize'] !== undefined) {
        model = model.with({ fontSize: q['span']['@fontSize'] });
      }
      if (q['span']['@fontWeight'] !== undefined) {
        model = model.with({ fontWeight: q['span']['@fontWeight'] });
      }
      if (q['span']['@fontStyle'] !== undefined) {
        model = model.with({ fontStyle: q['span']['@fontStyle'] });
      }
      if (q['span']['@textDecoration'] !== undefined) {
        model = model.with({ textDecoration: q['span']['@textDecoration'] });
      }
      if (q['span']['#text'] !== undefined) {
        model = model.with({ text: q['span']['#text'] });
      }
    }

    return model;
  }

  toPersistence() : Object {
    return {
      initiator: {
        '@assessmentId': this.assessmentId,
        span: {
          '@fontSize': this.fontSize,
          '@fontWeight': this.fontWeight,
          '@fontStyle': this.fontStyle,
          '@textDecoration': this.textDecoration,
          '#text': this.text,
        },
      },
    };
  }
}
