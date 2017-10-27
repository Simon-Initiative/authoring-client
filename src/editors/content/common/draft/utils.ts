
import { SelectionState } from 'draft-js';

export enum SelectionChangeType {
  Initial, 
  None,  // no change at all
  CursorPosition, // only the cursor position changed
  Selection // an actual selection change occurred
}

const log = (ss) => {
  // console.log(ss.getAnchorKey() + '(' + ss.getAnchorOffset() + ') - ' + ss.getFocusKey() + '(' + ss.getFocusOffset() + ')');
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
    for (let i = 0; i < clientRects.length; i++) {
      let c = clientRects.item(i);
      if (c.top < top.top) {
        top = c;
      }
    }

    return top;
  }


export function hasSelection(ss: SelectionState) {
  if (ss.getAnchorKey() !== ss.getFocusKey()) {
    return true;
  } else if (ss.getAnchorOffset() !== ss.getFocusOffset()) {
    return true;
  } else {
    return false; 
  }
}

export function removeHTML(text : string) : string {
  return text
    .replace(/<br>/i, '\n')
    .replace(/<\/div>/i, '')
    .replace(/<div>/i, '\n');
}

export function setCaretPosition(editableDiv, positionIndex) {
  editableDiv.focus();
  var textNode = editableDiv.firstChild;
  var range = document.createRange();
  range.setStart(textNode, positionIndex);
  range.setEnd(textNode, positionIndex);
  var sel = window.getSelection();
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
  var caretPos = 0,
    sel, range;
  if (window.getSelection) {
    sel = window.getSelection();
    if (sel.rangeCount) {
      range = sel.getRangeAt(0);
      if (range.commonAncestorContainer.parentNode == editableDiv) {
        caretPos = range.endOffset;
      }
    }
  } else if ((document as any).selection && (document as any).selection.createRange) {
    range = (document as any).selection.createRange();
    if (range.parentElement() == editableDiv) {
      var tempEl = document.createElement("span");
      editableDiv.insertBefore(tempEl, editableDiv.firstChild);
      var tempRange = range.duplicate();
      tempRange.moveToElementText(tempEl);
      tempRange.setEndPoint("EndToEnd", range);
      caretPos = tempRange.text.length;
    }
  }
  return caretPos;
}


export function determineChangeType(previous: SelectionState, current: SelectionState) : SelectionChangeType {

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
  } else {
    return SelectionChangeType.Selection;
  }

}
