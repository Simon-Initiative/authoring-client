import { Maybe } from 'tsmonad';
import { ActiveContextState } from 'reducers/active';
import { saveToLocalStorage, loadFromLocalStorage } from 'utils/localstorage';
import { registeredTypes } from 'data/content/common/parse';
import guid from 'utils/guid';
import { ContiguousText } from 'data/content/learning/contiguous';

export type SET_ITEM = 'clipboard/SET_ITEM';
export const SET_ITEM: SET_ITEM = 'clipboard/SET_ITEM';

export type SetItemAction = {
  type: SET_ITEM;
  item: Maybe<Object>;
};

export const setItem = (item: Object) => ({
  type: SET_ITEM,
  item,
});

export function cut(item: Object) {
  return function (dispatch, getState) {
    const { activeContext }: { activeContext: ActiveContextState } = getState();
    activeContext.textSelection.caseOf({
      just: sel => sel.isCollapsed
        ? saveToLocalStorage('clipboard', JSON.stringify(item))
        : undefined,
      nothing: () => saveToLocalStorage('clipboard', JSON.stringify(item)),
    });
    activeContext.container.lift(parent => parent.onRemove(item));
  };
}
export function copy(item) {
  return function (dispatch, getState) {

    // Clear clipboard contents. Clipboard cannot be set to the empty string.
    // tslint:disable-next-line:comment-format
    // https://stackoverflow.com/questions/400212/how-do-i-copy-to-the-clipboard-in-javascript
    const clearClipboardContents = () => {
      const input = document.createElement('textarea');
      input.value = ' ';
      document.body.appendChild(input);
      input.focus();
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
    };

    // Serialize active child selection
    const serialized = () => {
      let toSerialize = item.toPersistence();
      if (item.contentType === 'ContiguousText') {
        toSerialize = { isContiguousText: true, data: toSerialize };
      }
      return JSON.stringify(toSerialize);
    };

    const { activeContext }: { activeContext: ActiveContextState } = getState();
    // Copy the active child only if text within a Contiguous text block is not highlighted
    // This isn't right
    activeContext.textSelection.caseOf({
      just: (selection) => {
        console.log('selection is collapsed?', selection.isCollapsed())
        if (selection.isCollapsed()) {
          clearClipboardContents();
          saveToLocalStorage('clipboard', serialized());
        }
      },
      nothing: () => saveToLocalStorage('clipboard', serialized()),
    });
  };
}

export function paste() {
  return function (dispatch, getState) {

    const { activeContext }: { activeContext: ActiveContextState } = getState();


    const pasteInside = (parent) => {
      const savedData: any = loadFromLocalStorage('clipboard');
      if (savedData === null) {
        return;
      }

      let elementToPaste;
      // ContiguousText components serialize to lists of inline elements (e.g. 'p' tags),
      // so we handle that case separately
      if (savedData.isContiguousText) {
        elementToPaste = ContiguousText.fromPersistence(savedData.data, guid());

      // Otherwise, we look up the fromPersistence method from the data wrapper registry
      } else {
        const factoryFn = registeredTypes[Object.keys(savedData)[0]];
        elementToPaste = factoryFn(savedData, guid());
      }

      parent.onPaste(elementToPaste);
    };

    // Doesn't work - outdated method. can't figure out a way to read clipboard data?
    // const pasteData = () => {
    //   const input = document.createElement('textarea');
    //   document.body.appendChild(input);
    //   input.focus();
    //   input.select();
    //   document.execCommand('paste');
    //   const pastedText = input.value;
    //   document.body.removeChild(input);

    //   return pastedText;
    // };

    // implement paste validation by element type. e.g. dtd validation
    // grab parent's supported elements and don't paste if element is
    // not in supported elements list (list does not contain item)

    // Only paste if a component is selected and cursor is not inside a contiguous text editor
    // This doesn't work if a CTE is selected, even if the cursor isn't inside the text. How
    // do we change it so that it detects whether cursor is in or out of the text?
    activeContext.textSelection.caseOf({
      just: selection => console.log('selection', selection),
      nothing: () => {
        activeContext.container.caseOf({
          just: parent => pasteInside(parent),
          nothing: () => console.log('no container'),
        });
      },
    });
  };
}
