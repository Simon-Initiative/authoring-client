import * as Immutable from 'immutable';

import createGuid from 'utils/guid';
import { augment, getChildren, ensureIdGuidPresent, setId } from 'data/content/common';
import { getKey } from 'data/common';
import { Popout } from 'data/content/learning/popout';
import { Alternate } from 'data/content/learning/alternate';
import { Title } from 'data/content/learning/title';
import { Caption } from 'data/content/learning/caption';
import { Cite } from 'data/content/learning/cite';
import { Param } from 'data/content/learning/param';
import { Maybe } from 'tsmonad';

export type AppletParams = {
  id?: string,
  width?: string,
  height?: string,
  logging?: boolean,
  codebase?: string,
  archive?: string,
  code?: string,
  purpose?: Maybe<string>,
  popout?: Popout,
  alternate?: Alternate,
  titleContent?: Title,
  caption?: Caption,
  cite?: Cite,
  params?: Immutable.OrderedMap<string, Param>;
  guid?: string,
};

const defaultContent = {
  contentType: 'Applet',
  elementType: 'applet',
  id: '',
  width: '800',
  height: '450',
  logging: true,
  codebase: '',
  archive: '',
  code: '',
  purpose: Maybe.nothing(),
  popout: new Popout(),
  alternate: new Alternate(),
  titleContent: Title.fromText(''),
  caption: new Caption(),
  cite: new Cite(),
  params: Immutable.OrderedMap<string, Param>(),
  guid: '',
};

export class Applet extends Immutable.Record(defaultContent) {

  contentType: 'Applet';
  elementType: 'applet';
  id: string;
  width: string;
  height: string;
  logging: boolean;
  codebase: string;
  archive: string;
  code: string;
  purpose: Maybe<string>;
  popout: Popout;
  alternate: Alternate;
  titleContent: Title;
  caption: Caption;
  cite: Cite;
  params: Immutable.OrderedMap<string, Param>;
  guid: string;

  constructor(params?: AppletParams) {
    super(augment(params, true));
  }

  with(values: AppletParams) {
    return this.merge(values) as this;
  }

  clone(): Applet {
    return ensureIdGuidPresent(this.with({
      popout: this.popout.clone(),
      alternate: this.alternate.clone(),
      titleContent: this.titleContent.clone(),
      caption: this.caption.clone(),
      cite: this.cite.clone(),
      params: this.params.mapEntries(([_, v]) => {
        const clone: Param = v.clone();
        return [clone.guid, clone];
      }).toOrderedMap() as Immutable.OrderedMap<string, Param>,
    }));
  }

  static fromPersistence(root: Object, guid: string, notify: () => void): Applet {

    const t = (root as any).applet;

    let model = new Applet({ guid });

    model = setId(model, t, notify);

    if (t['@height'] !== undefined) {
      model = model.with({ height: t['@height'] });
    }
    if (t['@width'] !== undefined) {
      model = model.with({ width: t['@width'] });
    }
    if (t['@codebase'] !== undefined) {
      model = model.with({ codebase: t['@codebase'] });
    }
    if (t['@archive'] !== undefined) {
      model = model.with({ archive: t['@archive'] });
    }
    if (t['@code'] !== undefined) {
      model = model.with({ code: t['@code'] });
    }
    if (t['@purpose'] !== undefined) {
      model = model.with({ purpose: Maybe.just(t['@purpose']) });
    }
    if (t['@logging'] !== undefined) {
      model = model.with(
        { logging: t['@logging'] === 'true' ? true : false });
    }

    getChildren(t).forEach((item) => {

      const key = getKey(item);
      const id = createGuid();

      switch (key) {
        case 'popout':
          model = model.with({ popout: Popout.fromPersistence(item, id, notify) });
          break;
        case 'alternate':
          model = model.with(
            { alternate: Alternate.fromPersistence(item, id, notify) });
          break;
        case 'title':
          model = model.with(
            { titleContent: Title.fromPersistence(item, id, notify) });
          break;
        case 'caption':
          model = model.with({ caption: Caption.fromPersistence(item, id, notify) });
          break;
        case 'cite':
          model = model.with({ cite: Cite.fromPersistence(item, id, notify) });
          break;
        case 'param':
          model = model.with({
            params: model.params.set(id, Param.fromPersistence(item, id, notify)),
          });
          break;
        default:

      }
    });

    return model;
  }

  toPersistence(): Object {

    const children = [
      this.titleContent.toPersistence(),
      this.cite.toPersistence(),
      this.caption.toPersistence(),
      this.popout.toPersistence(),
      this.alternate.toPersistence(),
    ];

    this.params.toArray().forEach(t => children.push(t.toPersistence()));

    return {
      applet: {
        '@id': this.id ? this.id : createGuid(),
        '@height': this.height,
        '@width': this.width,
        '@codebase': this.codebase !== '' ? this.codebase : undefined,
        '@archive': this.archive !== '' ? this.archive : undefined,
        '@code': this.code,
        '@logging': this.logging ? 'true' : 'false',
        '@purpose': this.purpose.caseOf({ just: p => p, nothing: () => undefined }),
        '#array': children,
      },
    };
  }
}
