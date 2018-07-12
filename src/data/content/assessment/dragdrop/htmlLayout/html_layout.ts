import { CSSProperties, DOMElement } from 'react';
import * as Immutable from 'immutable';
import createGuid from 'utils/guid';
import { augment, getChildren } from 'data/content/common';
import { getKey } from 'data/common';
import { Initiator } from './initiator';
import { Maybe } from 'tsmonad';
import { TableTargetArea } from './table/table_targetarea';
import { UnsupportedTargetArea } from './unsupported/unsupported_targetarea';
import { domParser } from 'utils/domParser';

export type LayoutStyles = {
  [key: string]: CSSProperties;
};

const DEFAULT_STYLES = {};

export type TargetArea = TableTargetArea | UnsupportedTargetArea;

export const parseLayoutStyles = (json: Object) => {
  //TODO
  return {};
};

export const stringifyLayoutStyles = (styles: LayoutStyles) => {
  //TODO
  return '';
};

export const parseInitiators = (json: Object) => {
  const htmlStr = json['initiators']['#cdata'] as string;
  let html = Maybe.nothing<Element>();
  try {
    const htmlDoc = domParser.parseFromString(htmlStr, 'text/html');
    html = Maybe.just(
      // get first child of body element
      htmlDoc.getElementsByTagName('html').item(0)
        .getElementsByTagName('body').item(0)
        .firstChild as Element,
    );
  } catch (error) {
    console.error('failed to load table target area html: ', error);
  }

  return html.lift((htmlEl) => {
    if (Array.from(htmlEl.children).length > 0) {
      return Immutable.List<Initiator>(
        Array.from(htmlEl.children).map(
          initiatorDiv => Initiator.fromPersistence(initiatorDiv, createGuid())),
      );
    }

    return Immutable.List<Initiator>([Initiator.fromPersistence(htmlEl, createGuid())]);
  })
  .valueOr(Immutable.List<Initiator>());
};

export const stringifyInitiators = (initiators: Immutable.List<Initiator>) => {
  return initiators.reduce(
    (acc, initiator) => `${acc} <div input_val="${initiator.inputVal}">${initiator.text}</div>`,
    '',
  );
};

export type HTMLLayoutParams = {
  guid?: string;
  layoutStyles?: LayoutStyles;
  targetArea?: Maybe<TargetArea>;
  initiators?: Immutable.List<Initiator>;
};

const defaultContent = {
  contentType: 'HTMLLayout',
  elementType: 'htmllayout',
  guid: '',
  layoutStyles: DEFAULT_STYLES,
  targetArea: Maybe.nothing<TargetArea>(),
  initiators: Immutable.List<Initiator>(),
};

export class HTMLLayout extends Immutable.Record(defaultContent) {

  contentType: 'HTMLLayout';
  elementType: 'htmllayout';
  guid: string;
  layoutStyles: LayoutStyles;
  targetArea: Maybe<TargetArea>;
  initiators: Immutable.List<Initiator>;

  constructor(params?: HTMLLayoutParams) {
    super(augment(params));
  }

  with(values: HTMLLayoutParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(json: Object, guid: string) : HTMLLayout {

    const q = (json as any).dragdrop;
    let model = new HTMLLayout({ guid });

    getChildren(q).forEach((item) => {
      const key = getKey(item);
      const id = createGuid();
      switch (key) {
        case 'layoutStyles':
          model = model.with({ layoutStyles: parseLayoutStyles(item) });
          break;
        case 'targetArea':
          switch (true) {
            case item[key]['#cdata'] && item[key]['#cdata'].indexOf('oli-dnd-table') > -1:
              model = model.with({
                targetArea: Maybe.just(TableTargetArea.fromPersistence(item, id)) });
              break;
            case item[key]['#cdata']:
              model = model.with({
                targetArea: Maybe.just(UnsupportedTargetArea.fromPersistence(item, id)) });
              break;
            default:
              break;
          }
          break;
        case 'initiators':
          model = model.with({ initiators: parseInitiators(item) });
          break;
        default:
      }
    });

    return model;

  }

  toPersistence() : Object {
    return {
      dragdrop: {
        '#array': [
          {
            layoutStyles: { '#cdata': stringifyLayoutStyles(this.layoutStyles) },
          },
          {
            targetArea: this.targetArea.caseOf({
              just: targetArea => ({ '#cdata': targetArea.toPersistence() }),
              nothing: () => ({ '#cdata': '' }),
            }),
          },
          {
            initiators: { '#cdata': stringifyInitiators(this.initiators) },
          },
        ],
      },
    };
  }
}
