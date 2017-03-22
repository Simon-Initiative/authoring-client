
import { SelectionState } from 'draft-js';

export enum SelectionChangeType {
  Initial, 
  None,  // no change at all
  CursorPosition, // only the cursor position changed
  Selection // an actual selection change occurred
}

const log = (ss) => {
  console.log(ss.getAnchorKey() + '(' + ss.getAnchorOffset() + ') - ' + ss.getFocusKey() + '(' + ss.getFocusOffset() + ')');
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
    .replace(/<\/div>/i, '')
    .replace(/<div>/i, '\n');
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
