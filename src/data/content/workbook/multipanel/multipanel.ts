import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';
import createGuid from 'utils/guid';
import { ImageHotspot } from './image_hotspot';
import { Hotspot } from './hotspot';
import { getChildren, setId, ensureIdGuidPresent } from 'data/content/common';
import { getKey } from 'data/common';
import { Title } from 'data/content/learning/title';
import { WbInline } from '../wbinline';
import { Panel } from './panel';

export type MultipanelParams = {
  guid: string,
  id: string,
  purpose: Maybe<string>,
  title: Maybe<Title>,
  imageHotspot: ImageHotspot,
  panels: Immutable.List<Panel>,
  introPanelRef: Maybe<string>,
  inline: WbInline,
};

const defaults = (params: Partial<MultipanelParams> = {}) => ({
  contentType: 'Multipanel',
  elementType: 'multipanel',
  guid: params.guid || createGuid(),
  id: params.id || createGuid(),
  purpose: params.purpose || Maybe.nothing(),
  title: params.title || Maybe.nothing(),
  imageHotspot: params.imageHotspot || new ImageHotspot(),
  panels: params.panels || Immutable.List<Panel>(),
  introPanelRef: params.introPanelRef || Maybe.nothing(),
  inline: params.inline || new WbInline(),
});

export class Multipanel extends Immutable.Record(defaults()) {
  contentType: 'Multipanel';
  elementType: 'multipanel';
  guid: string;
  id: string;
  purpose: Maybe<string>;
  title: Maybe<Title>;
  imageHotspot: ImageHotspot;
  panels: Immutable.List<Panel>;
  introPanelRef: Maybe<string>;
  inline: WbInline;

  constructor(params: Partial<MultipanelParams>) {
    super(defaults(params));
  }

  clone() : Multipanel {
    return ensureIdGuidPresent(this.with({
      title: this.title.lift(title => title.clone()),
      imageHotspot: this.imageHotspot.clone(),
      panels: this.panels.map(p => p.clone()).toList(),
      inline: this.inline.clone(),
    }));
  }

  with(values: Partial<MultipanelParams>) {
    return this.merge(values) as this;
  }

  static fromPersistence(json: Object, guid: string, notify: () => void) : Multipanel {
    const q = (json as any).multipanel;
    let model = new Multipanel({ guid });

    model = setId(model, q, notify);
    model = model.with({ purpose: Maybe.maybe(q['@purpose']) });

    getChildren(q).forEach((item) => {
      const key = getKey(item);
      const id = createGuid();

      switch (key) {
        case 'title':
          model = model.with({
            title: Maybe.just(Title.fromPersistence(item, id, notify)),
          });
          break;
        case 'image_hotspot':
          model = model.with({
            imageHotspot: ImageHotspot.fromPersistence(item, id, notify),
          });
          break;
        case 'panels':
          model = model.with({ introPanelRef: Maybe.maybe(
            (item as any).panels['@intro_panel_ref']) });

          getChildren((item as any).panels).forEach((p) => {
            model = model.with({
              panels: model.panels.push(Panel.fromPersistence(p, createGuid(), notify)),
            });
          });
          break;
        case 'wb:inline':
          model = model.with({
            inline: WbInline.fromPersistence(item, id, notify),
          });
          break;
        default:
      }
    });

    return model;

  }

  toPersistence() : Object {
    return {
      multipanel: {
        '@id': this.id,
        ...(this.purpose.caseOf({
          just: purpose => ({ '@purpose': purpose }),
          nothing: () => ({}),
        })),
        '#array': [
          ...(this.title.caseOf({
            just: title => [title.toPersistence()],
            nothing: () => [],
          })),
          this.imageHotspot.toPersistence(),
          {
            panels: {
              ...(this.introPanelRef.caseOf({
                just: introPanelRef => ({ '@intro_panel_ref': introPanelRef }),
                nothing: () => ({}),
              })),
              '#array': this.panels.map(p => p.toPersistence()),
            },
          },
          this.inline.toPersistence(),
        ],
      },
    };
  }
}
