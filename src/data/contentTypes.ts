import * as Immutable from 'immutable';
import * as types from './types';

export const ContentTypes = types.strEnum([
  'LockContent',
  'HtmlContent',
  'TitleContent',
  'InlineAssessmentContent'
])

export type ContentTypes = keyof typeof ContentTypes;

export function createContent(object: any) : ContentType {
  switch (object.contentType) {
    case ContentTypes.LockContent: 
      return new LockContent(object);
    case ContentTypes.HtmlContent: 
      return new HtmlContent(object);
    case ContentTypes.TitleContent: 
      return new TitleContent(object);
    case ContentTypes.InlineAssessmentContent:
      return new InlineAssessmentContent(object);
  }
}

export type ContentType =
  LockContent |
  HtmlContent |
  TitleContent |
  InlineAssessmentContent


export type LockContentParams = {
  lockedBy?: string,
  lockedAt?: number 
};

export class LockContent extends Immutable.Record({contentType: 'LockContent', lockedBy: '', lockedAt: 0}) {
  
  contentType: 'LockContent';
  lockedBy: string;
  lockedAt: number; 
  
  constructor(params?: LockContentParams) {
    params ? super(deserialize(params)) : super();
  }

  with(values: LockContentParams) {
    return this.merge(values) as this;
  }
}


export type TitleContentParams = {
  text?: string
};

export class TitleContent extends Immutable.Record({contentType: 'TitleContent', text: ''}) {
  
  contentType: 'TitleContent';
  text: string;
  
  constructor(params?: TitleContentParams) {
    params ? super(deserialize(params)) : super();
  }

  with(values: TitleContentParams) {
    return this.merge(values) as this;
  }
}

export type HtmlContentParams = {
  blocks: Object[],
  entityMap: Object
};

const defaultHtmlContentParams = {
  blocks: [{
    text: (
      'Sample text'
    ),
    type: 'unstyled',
    entityRanges: [],
  }], 
  entityMap: {},
  contentType: 'HtmlContent'
};

export class HtmlContent extends Immutable.Record(defaultHtmlContentParams) {

  contentType: 'HtmlContent';

  blocks: Object[];
  entityMap: Object;
  
  constructor(params?: HtmlContentParams) {
    // We do not use the deserielize here only because HtmlContent is still just
    // a thin wrapper for the Draft.js ContentState object 
    params ? super(params) : super();
  }

  with(values: HtmlContentParams) {
    return this.merge(values) as this;
  }
}

export type InlineAssessmentContentParams = {
  timeLimit: number,
  questions: Immutable.List<types.DocumentId>
};

export class InlineAssessmentContent extends Immutable.Record({contentType: 'InlineAssessmentContent', timeLimit: 0, questions: Immutable.List<types.DocumentId>()}) {

  contentType: 'InlineAssessmentContent';
  timeLimit: number;
  questions: Immutable.List<types.DocumentId>;
  
  constructor(params?: InlineAssessmentContentParams) {
    params ? super(deserialize(params)) : super();
  }

  with(values: InlineAssessmentContentParams) {
    return this.merge(values) as this;
  }
}

/**
 * Deserialize possible JavaScript primitives back into
 * Immutable primitives or Immutable contentType wrappers
 */
export function deserialize(object: any) : any {
  return Object
    .keys(object)
    .reduce((o, key) => { 

      if (object[key] instanceof Array) {
        // TODO handle lists of non JS primitive types
        o[key] = Immutable.List(object[key]);
      
      } else if (object[key].contentType !== undefined
        && !(object[key] instanceof Immutable.Record)) {
        o[key] = createContent(object[key]);
      } else {
        o[key] = object[key];
      }
      return o;
    }, {});
}

