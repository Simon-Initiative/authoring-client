import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';
import { augment } from 'data/content/common';
import { domParser } from 'utils/domParser';

export type UnsupportedTargetAreaParams = {
  guid?: string;
  html?: Maybe<Element>;
};

const defaultContent = {
  contentType: 'UnsupportedTargetArea',
  elementType: 'unsupportedtargetarea',
  guid: '',
  html: Maybe.nothing<Element>(),
};

export class UnsupportedTargetArea extends Immutable.Record(defaultContent) {

  contentType: 'UnsupportedTargetArea';
  elementType: 'unsupportedtargetarea';
  guid: string;
  html: Maybe<Element>;

  constructor(params?: UnsupportedTargetAreaParams) {
    super(augment(params));
  }

  with(values: UnsupportedTargetAreaParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(json: Object, guid: string) : UnsupportedTargetArea {
    const q = (json as any).targetArea;

    const htmlStr = q['#cdata'] as string;
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
      html = Maybe.nothing();
    }

    const model = new UnsupportedTargetArea({
      guid,
      html,
    });

    return model;
  }

  toPersistence() : Object {
    return {
      '#cdata': this.html.caseOf({
        just: html => html.outerHTML,
        nothing: () => '',
      }),
    };
  }
}
