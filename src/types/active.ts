import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';
import { ContentElement } from 'data/content/common/interfaces';
import { Selection } from 'slate';
import { Editor } from 'slate-react';

export enum Trigger {
  KEYPRESS,
  OTHER,
}

export class TextSelection {

  static createEmpty(key) {
    return new TextSelection(Selection.create({}));
  }

  slate: Selection;
  triggeredBy: Trigger;

  constructor(slate) {

    this.slate = slate;
  }

  getAnchorKey() {
    return this.slate.anchor.key;
  }

  getFocusKey() {
    return this.slate.focus.key;
  }

  getAnchorOffset() {
    return this.slate.anchor.offset;
  }

  getFocusOffset() {
    return this.slate.focus.offset;
  }

  getIsBackward() {
    return this.slate.isBackward;
  }

  getHasFocus() {
    return this.slate.isFocused;
  }

  isCollapsed() {
    return this.slate.isCollapsed;
  }

  hasEdgeWithin(blockKey, start, end) {

    // TODO
    return false;

  }

  getRawSelectionState() {
    return this.slate;
  }

  merge(params) {
    return new TextSelection(this.slate.merge(params));
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
  documentId?: Maybe<string>,
  container?: Maybe<ParentContainer>,
  activeChild?: Maybe<ContentElement>,
  textSelection?: Maybe<TextSelection>,
  editor?: Maybe<Editor>,
};

const defaultContent = {
  documentId: Maybe.nothing(),
  container: Maybe.nothing(),
  activeChild: Maybe.nothing(),
  textSelection: Maybe.nothing(),
  editor: Maybe.nothing(),
};

export class ActiveContext extends Immutable.Record(defaultContent) {

  // The id of the parent document
  documentId: Maybe<string>;

  // The parent container
  container: Maybe<ParentContainer>;

  // The current active child component of the parent container
  activeChild: Maybe<ContentElement>;

  // The current text selection
  textSelection: Maybe<TextSelection>;

  // The current active slate editor
  editor: Maybe<Editor>;

  constructor(params?: ActiveContextParams) {
    super(params);
  }

  with(values: ActiveContextParams) {
    return this.merge(values) as this;
  }

}
