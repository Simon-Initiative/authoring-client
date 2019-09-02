
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

