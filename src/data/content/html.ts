import * as Immutable from 'immutable';
import { ContentState } from 'draft-js';
import { toPersistence } from './html/topersistence';
import { toDraft } from './html/todraft';

const emptyContent = ContentState.createFromText('');


export type HtmlParams = {
  contentState: ContentState,
  guid?: string
};

const defaultHtmlParams = {
  contentType: 'Html',
  contentState: emptyContent,
  guid: ''
};

export class Html extends Immutable.Record(defaultHtmlParams) {

  contentType: 'Html';

  contentState: ContentState;
  guid: string;
  
  constructor(params?: HtmlParams) {
    // We do not use the deserialize here only because Html is just
    // a thin wrapper for the Draft.js ContentState object 
    params ? super(params) : super();
  }

  with(values: HtmlParams) {
    return this.merge(values) as this;
  }

  toPersistence() : any {
    return toPersistence(this.contentState);
  }

  static fromPersistence(json: Object, guid: string) : Html {
    return new Html().with({ contentState: toDraft(json), guid});
  }
}