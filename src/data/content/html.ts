import * as Immutable from 'immutable';
import { ContentState } from 'draft-js';
import { toPersistence } from './html/topersistence';
import { toDraft } from './html/todraft';
import createGuid from '../../utils/guid';
import { augment } from './common';

const emptyContent = ContentState.createFromText('');


export type HtmlParams = {
  contentState?: ContentState,
  guid?: string,
};

const defaultHtmlParams = {
  contentType: 'Html',
  contentState: emptyContent,
  guid: '',
};

export class Html extends Immutable.Record(defaultHtmlParams) {

  contentType: 'Html';

  contentState: ContentState;
  guid: string;
  
  constructor(params?: HtmlParams) {
    super(augment(params));
  }

  with(values: HtmlParams) {
    return this.merge(values) as this;
  }

  toPersistence() : any {
    return toPersistence(this.contentState);
  }

  static fromPersistence(json: Object, guid: string) : Html {
    return new Html().with({ contentState: toDraft(json), guid });
  }
}
