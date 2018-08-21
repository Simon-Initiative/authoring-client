import * as Immutable from 'immutable';
import createGuid from 'utils/guid';
import { augment, getChildren } from 'data/content/common';
import { getKey } from 'data/common';
import { Initiator } from 'data/content/assessment/dragdrop/htmlLayout/initiator';
import { Maybe } from 'tsmonad';
import { TableTargetArea } from
  'data/content/assessment/dragdrop/htmlLayout/table/table_targetarea';
import { UnsupportedTargetArea } from
  'data/content/assessment/dragdrop/htmlLayout/unsupported/unsupported_targetarea';
import { domParser } from 'utils/domParser';

/**
 * MINIFIED_TABLE_STYLES is generated using css in html_layout_styles.css.
 * See html_layout_styles.css for more details.
 */
const MINIFIED_TABLE_STYLES = `<style type="text/css">
.oli-dnd-table{display:table;text-align:center}.dnd-row{display:table-row}.dnd-\
row-header{font-weight:600;background-color:#cacaca;text-align:center}.dnd-cell{\
display:table-cell;padding:4px}.target{min-width:50px;min-height:50px;padding:4p\
x;border:1px dashed #999}.initiator{color:#58646c;border:2px solid transparent;p\
adding:6px;display:inline-block;font-size:14px;box-shadow:2px 2px 10px 0 rgba(15\
5,165,173,1);border-radius:5px;white-space:nowrap;margin:5px;background-color:#E7\
F4FE;cursor:grab;cursor:-webkit-grab;user-select:none}.initiator::before{content\
:"";display:inline-block;vertical-align:middle;margin-right:4px;width:12px;height\
:24px;background-image:-webkit-repeating-radial-gradient(center center,rgba(0,0,0\
,.2),rgba(0,0,0,.3) 1px,transparent 1px,transparent 100%);background-repeat:repeat;\
background-size:4px 4px}.initiator:active{cursor:grabbing;cursor:-webkit-grabbing}
</style>`;

export type TargetArea = TableTargetArea | UnsupportedTargetArea;

export const parseInitiators = (json: Object) => {
  const htmlStr = json['initiators']['#cdata'] as string;
  let html = Maybe.nothing<Element>();
  try {
    const htmlDoc = domParser.parseFromString(htmlStr, 'text/html');
    html = Maybe.just(
      // get first child of body element
      htmlDoc.getElementsByTagName('html').item(0)
        .getElementsByTagName('body').item(0) as Element,
    );
  } catch (error) {
    console.error('failed to load table target area html: ', error);
  }

  return html.lift((htmlEl) => {
    return Immutable.List<Initiator>(
      Array.from(htmlEl.children).map(
        initiatorDiv => Initiator.fromPersistence(initiatorDiv, createGuid())),
    );
  })
  .valueOr(Immutable.List<Initiator>());
};

export const stringifyInitiators = (initiators: Immutable.List<Initiator>) => {
  return initiators.reduce(
    (acc, initiator) => `${acc} ${initiator.toPersistence()}`,
    '',
  );
};

export type HTMLLayoutParams = {
  guid?: string;
  layoutStyles?: string;
  targetArea?: TargetArea;
  initiators?: Immutable.List<Initiator>;
};

const defaultContent = {
  contentType: 'DndHTMLLayout',
  elementType: 'dragdrop',
  guid: '',
  layoutStyles: MINIFIED_TABLE_STYLES,
  targetArea: new TableTargetArea(),
  initiators: Immutable.List<Initiator>(),
};

export class HTMLLayout extends Immutable.Record(defaultContent) {

  contentType: 'DndHTMLLayout';
  elementType: 'dragdrop';
  guid: string;
  layoutStyles: string;
  targetArea: TargetArea;
  initiators: Immutable.List<Initiator>;

  constructor(params?: HTMLLayoutParams) {
    super(augment(params));
  }

  clone() {
    return this.with({
      targetArea: this.targetArea.clone(),
      initiators: this.initiators.map(i => i.clone()).toList(),
    });
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
          model = model.with({
            layoutStyles: item[key] && item[key]['#cdata'] || MINIFIED_TABLE_STYLES });
          break;
        case 'targetArea':
          switch (true) {
            case item[key]['#cdata'] && item[key]['#cdata'].indexOf('oli-dnd-table') > -1:
              model = model.with({
                targetArea: TableTargetArea.fromPersistence(item, id) });
              break;
            case item[key]['#cdata']:
              model = model.with({
                targetArea: UnsupportedTargetArea.fromPersistence(item, id) });
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
      [this.elementType]: {
        '#array': [
          {
            layoutStyles: {
              '#cdata': this.layoutStyles,
            },
          },
          this.targetArea.toPersistence(),
          {
            initiators: {
              '#cdata': stringifyInitiators(this.initiators),
            },
          },
        ],
      },
    };
  }
}
