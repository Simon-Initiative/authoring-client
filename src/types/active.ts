import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';

export interface ParentContainer {
  supportedElements: Immutable.List<string>;
  onAddNew: (content: Object) => void;
  onEdit: (content: Object, source: Object) => void;
}

export type ActiveContextParams = {
  documentId? : Maybe<string>,
  container?: Maybe<ParentContainer>,
  activeChild?: Maybe<Object>,
};

const defaultContent = {
  documentId: Maybe.nothing(),
  container: Maybe.nothing(),
  activeChild: Maybe.nothing(),
};

export class ActiveContext extends Immutable.Record(defaultContent) {

  // The id of the parent document
  documentId: Maybe<string>;

  // The parent container
  container: Maybe<ParentContainer>;

  // The current active child component of the parent container
  activeChild: Maybe<Object>;


  constructor(params?: ActiveContextParams) {
    super(params);
  }

  with(values: ActiveContextParams) {
    return this.merge(values) as this;
  }

}
