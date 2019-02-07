import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';
import createGuid from 'utils/guid';
import { ensureIdGuidPresent, setId } from 'data/content/common';
import {
  ContentElements, MATERIAL_ELEMENTS, ELEMENTS_MIXED, CONTROL_ELEMENTS,
} from 'data/content/common/elements';

export type PanelParams = {
  guid: string,
  id: string,
  title: Maybe<string>,
  content: ContentElements,
};

const defaults = (params: Partial<PanelParams> = {}) => ({
  contentType: 'Panel',
  elementType: 'panel',
  guid: params. guid || createGuid(),
  id: params.id || createGuid(),
  title: params.title || Maybe.nothing(),
  content: params.content || ContentElements.fromText(
    '', createGuid(), [...MATERIAL_ELEMENTS, ...ELEMENTS_MIXED, ...CONTROL_ELEMENTS]),
});

export class Panel extends Immutable.Record(defaults()) {
  contentType: 'Panel';
  elementType: 'panel';
  guid: string;
  id: string;
  title: Maybe<string>;
  content: ContentElements;  // Supports PANEL_ELEMENTS

  constructor(params?: Partial<PanelParams>) {
    super(defaults(params));
  }

  clone() : Panel {
    return ensureIdGuidPresent(this.with({
      content: this.content.clone(),
    }));
  }

  with(values: Partial<PanelParams>) {
    return this.merge(values) as this;
  }

  static fromPersistence(json: Object, guid: string, notify: () => void) : Panel {
    const item = (json as any).panel;

    let model = new Panel({ guid });

    model = setId(model, item, notify);
    model = model.with({ title: Maybe.maybe(item['@title']) });
    model = model.with({
      content: ContentElements.fromPersistence(
        item,
        createGuid(),
        [...MATERIAL_ELEMENTS, ...ELEMENTS_MIXED, ...CONTROL_ELEMENTS],
        null,
        notify,
      ),
    });

    return model;
  }

  toPersistence() : Object {
    const encoded = this.content.toPersistence();
    const content = encoded.length === 0 ? [{
      p: {
        '#text': ' ',
        '@id': createGuid(),
      },
    }] : encoded;

    return {
      panel: {
        '@id': this.id,
        ...(this.title.caseOf({
          just: title => ({ '@title': title }),
          nothing: () => ({}),
        })),
        '#array': content,
      },
    };
  }
}
