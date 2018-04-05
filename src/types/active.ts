import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';
import { SelectionState } from 'draft-js';

export class TextSelection {

  static createEmpty(key) {
    return new TextSelection(SelectionState.createEmpty(key));
  }

  ss: SelectionState;

  constructor(ss) {
    this.ss = ss;
  }

  getAnchorKey() {
    return this.ss.getStartKey();
  }

  getFocusKey() {
    return this.ss.getFocusKey();
  }

  getAnchorOffset() {
    return this.ss.getAnchorOffset();
  }

  getFocusOffset() {
    return this.ss.getFocusOffset();
  }

  getIsBackward() {
    return this.ss.getIsBackward();
  }

  getHasFocus() {
    return this.ss.getHasFocus();
  }

  isCollapsed() {
    return this.ss.isCollapsed();
  }

  hasEdgeWithin(blockKey, start, end) {
    return this.ss.hasEdgeWithin(blockKey, start, end);
  }

  getRawSelectionState() {
    return this.ss;
  }

  merge(params) {
    return new TextSelection(this.ss.merge(params));
  }
}

export interface ParentContainer {
  supportedElements: Immutable.List<string>;
  onAddNew: (content: Object, textSelection: Maybe<TextSelection>) => void;
  onEdit: (content: Object, source: Object) => void;
  onRemove: (content: Object) => void;
  onDuplicate: (content: Object) => void;
  onMoveUp: (content: Object) => void;
  onMoveDown: (content: Object) => void;
}

export type ActiveContextParams = {
  documentId? : Maybe<string>,
  container?: Maybe<ParentContainer>,
  activeChild?: Maybe<Object>,
  textSelection?: Maybe<TextSelection>,
};

const defaultContent = {
  documentId: Maybe.nothing(),
  container: Maybe.nothing(),
  activeChild: Maybe.nothing(),
  textSelection: Maybe.nothing(),
};

export class ActiveContext extends Immutable.Record(defaultContent) {

  // The id of the parent document
  documentId: Maybe<string>;

  // The parent container
  container: Maybe<ParentContainer>;

  // The current active child component of the parent container
  activeChild: Maybe<Object>;

  // The current text selection
  textSelection: Maybe<TextSelection>;

  constructor(params?: ActiveContextParams) {
    super(params);
  }

  with(values: ActiveContextParams) {
    return this.merge(values) as this;
  }

}
