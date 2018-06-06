import * as Immutable from 'immutable';
import { augment } from '../../common';

export type DndTextParams = {
  guid?: string;
  fontWeight?: string;
  fontSize?: string;
  fontStyle?: string;
  textDecoration?: string;
  text?: string;
  textType?: string;
};

const defaultContent = {
  contentType: 'DndText',
  elementType: 'text',
  guid: '',
  fontWeight: 'normal',
  fontSize: '12',
  fontStyle: 'normal',
  textDecoration: 'none',
  text: '',
  textType: 'span',
};

export class DndText extends Immutable.Record(defaultContent) {

  contentType: 'DndText';
  elementType: 'text';
  guid: string;
  fontWeight: string;
  fontSize: string;
  fontStyle: string;
  textDecoration: string;
  text: string;
  textType: string;

  constructor(params?: DndTextParams) {
    super(augment(params));
  }

  with(values: DndTextParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(json: Object, guid: string) : DndText {

    const q = (json as any).text;
    let model = new DndText({ guid });

    const textType = q['span'] ? 'span' : q['p'] ? 'p' : undefined;

    if (textType !== undefined) {
      model = model.with({
        textType,
      });

      if (q[textType]['@fontWeight'] !== undefined) {
        model = model.with({ fontWeight: q[textType]['@fontWeight'] });
      }
      if (q[textType]['@fontSize'] !== undefined) {
        model = model.with({ fontSize: q[textType]['@fontSize'] });
      }
      if (q[textType]['@fontStyle'] !== undefined) {
        model = model.with({ fontStyle: q[textType]['@fontStyle'] });
      }
      if (q[textType]['@textDecoration'] !== undefined) {
        model = model.with({ textDecoration: q[textType]['@textDecoration'] });
      }
      if (q[textType]['#text'] !== undefined) {
        model = model.with({ text: q[textType]['#text'] });
      }
    }

    return model;
  }

  toPersistence() : Object {
    return {
      text: {
        [this.textType]: {
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
