import * as Immutable from 'immutable';

export interface ParentContainer {
  supportedElements: Immutable.List<string>;
  onAddNew: (content: Object) => void;
  onEdit: (content: Object) => void;
}

export type ActiveContextParams = {
  documentId? : string,
  container?: ParentContainer,
  activeChild?: Object,
};

const defaultContent = {
  documentId: '',
  container: null,
  activeChild: null,
};

export class ActiveContext extends Immutable.Record(defaultContent) {

  // The id of the parent document
  documentId: string;

  // The parent container
  container: ParentContainer;

  // The current active child component of the parent container
  activeChild: Object;


  constructor(params?: ActiveContextParams) {
    super(params);
  }

  with(values: ActiveContextParams) {
    return this.merge(values) as this;
  }

}
