import * as Immutable from 'immutable';
import { augment } from '../../common';

export type DndTextParams = {
  guid?: string;
  fontWeight?: string;
  fontSize?: string;
  fontStyle?: string;
  textDecoration?: string;
  text?: string;
};

const defaultContent = {
  contentType: 'DndText',
  guid: '',
  fontWeight: 'normal',
  fontSize: '12',
  fontStyle: 'normal',
  textDecoration: 'none',
  text: '',
};

export class DndText extends Immutable.Record(defaultContent) {

  contentType: 'DndText';
  guid: string;
  fontWeight: string;
  fontSize: string;
  fontStyle: string;
  textDecoration: string;
  text: string;

  constructor(params?: DndTextParams) {
    super(augment(params));
  }

  with(values: DndTextParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(json: Object, guid: string) : DndText {

    const q = (json as any).text;
    let model = new DndText({ guid });

    if (q['span'] !== undefined) {
      if (q['span']['@fontWeight'] !== undefined) {
        model = model.with({ fontWeight: q['span']['@fontWeight'] });
      }
      if (q['span']['@fontSize'] !== undefined) {
        model = model.with({ fontSize: q['span']['@fontSize'] });
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
      text: {
        span: {
          '@fontWeight': this.fontWeight,
          '@fontSize': this.fontSize,
          '@fontStyle': this.fontStyle,
          '@textDecoration': this.textDecoration,
          '#text': this.text,
        },
      },
    };
  }
}
