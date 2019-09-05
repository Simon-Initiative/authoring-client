import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';
import { ContentElement } from 'data/content/common/interfaces';
import { Selection, Editor } from 'slate';

export enum Trigger {
  KEYPRESS,
  OTHER,
}

export class TextSelection {

  static createEmpty(key) {
    return new TextSelection(Selection.create({}));
  }

  anchorKey: string;
  anchorOffset: number;
  focusKey: string;
  focusOffset: number;
  isBackward: boolean;
  hasFocus: boolean;
  collapsed: boolean;
  triggeredBy: Trigger;

  constructor(slate) {
    this.anchorKey = slate.anchor.key;
    this.focusKey = slate.focus.key;
    this.anchorOffset = slate.anchor.offset;
    this.focusOffset = slate.focus.offset;
    this.isBackward = slate.isBackward;
    this.hasFocus = slate.isFocused;
    this.collapsed = slate.isCollapsed;
  }

  getAnchorKey() {
    return this.anchorKey;
  }

  getFocusKey() {
    return this.focusKey;
  }

  getAnchorOffset() {
    return this.anchorOffset;
  }

  getFocusOffset() {
    return this.focusOffset;
  }

  getIsBackward() {
    return this.isBackward;
  }

  getHasFocus() {
    return this.hasFocus;
  }

  isCollapsed() {
    return this.collapsed;
  }

}

export interface ParentContainer {
  supportedElements: Immutable.List<string>;
  onAddNew: (
    content: ContentElement | ContentElement[], editor: Maybe<Editor>) => void;
  onEdit: (content: ContentElement, source: Object) => void;
  onRemove: (content: ContentElement) => void;
  onPaste: (content: ContentElement,
    editor: Maybe<Editor>) => void;
  onDuplicate: (content: ContentElement) => void;
  onMoveUp: (content: ContentElement) => void;
  onMoveDown: (content: ContentElement) => void;
}

export type ActiveContextParams = {
  documentId?: Maybe<string>,
  container?: Maybe<ParentContainer>,
  activeChild?: Maybe<ContentElement>,
  editor?: Maybe<Editor>,
};

const defaultContent = {
  documentId: Maybe.nothing(),
  container: Maybe.nothing(),
  activeChild: Maybe.nothing(),
  editor: Maybe.nothing(),
};

export class ActiveContext extends Immutable.Record(defaultContent) {

  // The id of the parent document
  documentId: Maybe<string>;

  // The parent container
  container: Maybe<ParentContainer>;

  // The current active child component of the parent container
  activeChild: Maybe<ContentElement>;

  // The current active slate editor
  editor: Maybe<Editor>;

  constructor(params?: ActiveContextParams) {
    super(params);
  }

  with(values: ActiveContextParams) {
    return this.merge(values) as this;
  }

}
