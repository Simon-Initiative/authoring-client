import * as Immutable from 'immutable';
import { ContentState, Modifier, SelectionState } from 'draft-js';
import guid from 'utils/guid';
import { getAllEntities } from 'data/content/html/changes';

export enum SelectionChangeType {
  Initial,
  None,  // no change at all
  CursorPosition, // only the cursor position changed
  Selection, // an actual selection change occurred
}

export function getCursorPosition() {
  try {
    const selection = document.getSelection();
    const range = document.createRange();
    range.selectNode(selection.anchorNode);
    const rect = range.getBoundingClientRect();
    return {
      x: rect.left,
      y: rect.top,
    };
  } catch (err) {
    return null;
  }
}

export function getPosition() {
  const selection = document.getSelection();
  if (selection.rangeCount === 0) return null;

  const range = selection.getRangeAt(0);
  const clientRects = range.getClientRects();

  let top = clientRects.item(0);
  for (let i = 0; i < clientRects.length; i = i + 1) {

    const c = clientRects.item(i);
    if (c.top < top.top) {
      top = c;
    }
  }

  return top;
}


export function hasSelection(ss: SelectionState) {
  if (ss.getAnchorKey() !== ss.getFocusKey()) {
    return true;
  } if (ss.getAnchorOffset() !== ss.getFocusOffset()) {
    return true;
  }
  return false;
}

export function removeHTML(text : string) : string {
  return text
    .replace(/<br>/i, '\n')
    .replace(/<\/div>/i, '')
    .replace(/<div>/i, '\n');
}

export function setCaretPosition(editableDiv, positionIndex) {
  editableDiv.focus();
  const textNode = editableDiv.firstChild;
  const range = document.createRange();
  range.setStart(textNode, positionIndex);
  range.setEnd(textNode, positionIndex);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
}

export function getSelectionRange(editableDiv) : Object {
  if (window.getSelection) {
    const sel = window.getSelection();
    if (sel.rangeCount) {
      const range = sel.getRangeAt(0);
      return range;
    }
  } else {
    return null;
  }
}


export function getCaretPosition(editableDiv) {
  let caretPos = 0;
  let sel;
  let range;

  if (window.getSelection) {
    sel = window.getSelection();
    if (sel.rangeCount) {
      range = sel.getRangeAt(0);
      if (range.commonAncestorContainer.parentNode === editableDiv) {
        caretPos = range.endOffset;
      }
    }
  } else if ((document as any).selection && (document as any).selection.createRange) {
    range = (document as any).selection.createRange();

    if (range.parentElement() === editableDiv) {

      const tempEl = document.createElement('span');
      editableDiv.insertBefore(tempEl, editableDiv.firstChild);
      const tempRange = range.duplicate();
      tempRange.moveToElementText(tempEl);
      tempRange.setEndPoint('EndToEnd', range);
      caretPos = tempRange.text.length;
    }
  }
  return caretPos;
}


export function determineChangeType(
  previous: SelectionState, current: SelectionState): SelectionChangeType {

  if (previous === null) {
    return SelectionChangeType.Initial;
  }

  // if identifical, then no change
  if (previous.getAnchorKey() === current.getAnchorKey()
    && previous.getAnchorOffset() === current.getAnchorOffset()
    && previous.getFocusKey() === current.getFocusKey()
    && previous.getFocusOffset() === current.getFocusOffset()) {

    return SelectionChangeType.None;
  }

  const previousHasSelection : boolean = hasSelection(previous);
  const currentHasSelection : boolean = hasSelection(current);

  if (!currentHasSelection && !previousHasSelection) {
    return SelectionChangeType.CursorPosition;
  }
  return SelectionChangeType.Selection;

}

function getSingularKey(o) {
  if (Object.keys(o).length === 1) {
    return Object.keys(o)[0];
  }
  return null;
}

export function cloneDuplicatedEntities(current: ContentState) : ContentState {
  let contentState = current;
  const entities = getAllEntities(contentState);

  // Find any duplicated entities and clone them
  const seenKeys = {};
  entities.forEach((e) => {
    if (seenKeys[e.entityKey] === undefined) {
      seenKeys[e.entityKey] = e;
    } else {
      // This is a duplicate, clone it

      const copy = Object.assign({}, e.entity.data);

      // If the data has an id, generate a new one to
      // avoid duplication
      if (copy.id !== undefined) {
        copy.id = guid();
      } else {
        const key = getSingularKey(copy);
        if (key !== null && copy[key].id !== undefined) {
          copy[key] = copy[key].with({ id: guid() });
        }
      }

      contentState = contentState.createEntity(
        e.entity.type, e.entity.mutability, copy);
      const createdKey = contentState.getLastCreatedEntityKey();
      const range = new SelectionState({
        anchorKey: e.range.contentBlock.key,
        focusKey: e.range.contentBlock.key,
        anchorOffset: e.range.start,
        focusOffset: e.range.end,
      });
      contentState = Modifier.applyEntity(contentState, range, createdKey);
    }
  });

  return contentState;
}
