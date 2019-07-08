import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';
import { SelectionState } from 'draft-js';
import { ContentElement } from 'data/content/common/interfaces';
import { DocumentId } from 'data/types';

export enum Trigger {
  KEYPRESS,
  OTHER,
}

export class TextSelection {

  static createEmpty(key) {
    return new TextSelection(SelectionState.createEmpty(key));
  }

  ss: SelectionState;
  triggeredBy: Trigger;

  constructor(ss) {
    this.ss = ss;
  }

  getAnchorKey() {
    return this.ss.getAnchorKey();
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
  onAddNew: (
    content: ContentElement | ContentElement[], textSelection: Maybe<TextSelection>) => void;
  onEdit: (content: ContentElement, source: Object) => void;
  onRemove: (content: ContentElement) => void;
  onPaste: (content: ContentElement, textSelection: Maybe<TextSelection>) => void;
  onDuplicate: (content: ContentElement) => void;
  onMoveUp: (content: ContentElement) => void;
  onMoveDown: (content: ContentElement) => void;
}

export type ActiveContextParams = {
  documentId?: Maybe<DocumentId>,
  container?: Maybe<ParentContainer>,
  activeChild?: Maybe<ContentElement>,
  textSelection?: Maybe<TextSelection>,
};

const defaultContent = {
  documentId: Maybe.nothing<DocumentId>(),
  container: Maybe.nothing<ParentContainer>(),
  activeChild: Maybe.nothing<ContentElement>(),
  textSelection: Maybe.nothing<TextSelection>(),
};

export class ActiveContext extends Immutable.Record(defaultContent) {

  // The id of the parent document
  documentId: Maybe<DocumentId>;

  // The parent container
  container: Maybe<ParentContainer>;

  // The current active child component of the parent container
  activeChild: Maybe<ContentElement>;

  // The current text selection
  textSelection: Maybe<TextSelection>;

  constructor(params?: ActiveContextParams) {
    super(params);
  }

  with(values: ActiveContextParams) {
    return this.merge(values) as this;
  }

}
