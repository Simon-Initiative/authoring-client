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
    const { activeContext }: { activeContext: ActiveContextState } = getState();

    activeContext.textSelection.caseOf({
      just: (selection) => {
        if (selection.isCollapsed()) {
          console.log('1');
          clearClipboardContents();
          saveToLocalStorage('clipboard', serialized());
        } else {
          console.log('2');
          document.execCommand('copy');
        }
      },
      nothing: () => {
        console.log('3');
        saveToLocalStorage('clipboard', serialized());
      },
    });

    // Clear clipboard contents. Clipboard cannot be set to the empty string.
    // tslint:disable-next-line:comment-format
    // https://stackoverflow.com/questions/400212/how-do-i-copy-to-the-clipboard-in-javascript
    function clearClipboardContents() {
      const input = document.createElement('textarea');

      input.style.position = 'fixed';
      input.style.top = '0';
      input.style.left = '0';
      // Ensure it has a small width and height. Setting to 1px / 1em
      // doesn't work as this gives a negative w/h on some browsers.
      input.style.width = '1px';
      input.style.height = '1px';
      input.style.padding = '0';
      input.style.border = 'none';
      input.style.outline = 'none';
      input.style.boxShadow = 'none';
      input.style.background = 'transparent';

      input.value = ' ';
      document.body.appendChild(input);
      input.focus();
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
    }

    // Serialize active child selection
    function serialized() {
      let toSerialize = item.toPersistence();
      if (item.contentType === 'ContiguousText') {
        toSerialize = { isContiguousText: true, data: toSerialize };
      }
      return JSON.stringify(toSerialize);
    }
  };
}

export function paste() {
  return function (dispatch, getState) {

    console.log('In paste action');

    const { activeContext }: { activeContext: ActiveContextState } = getState();

    // How to cancel paste action if cursor is inside text selection?
    activeContext.container.caseOf({
      just: parent => pasteInside(parent),
      nothing: () => console.log('no container'),
    });

    function pasteInside(parent) {
      const savedData: any = loadFromLocalStorage('clipboard');
      if (savedData === null) {
        return;
      }

      let elementToPaste;
      const { textSelection } = activeContext;
      // ContiguousText components serialize to lists of inline elements (e.g. 'p' tags),
      // so we handle that case separately
      if (savedData.isContiguousText) {
        elementToPaste = ContiguousText.fromPersistence(savedData.data, guid());

        // Otherwise, we look up the fromPersistence method from the data wrapper registry
      } else {
        const factoryFn = registeredTypes[Object.keys(savedData)[0]];
        elementToPaste = factoryFn(savedData, guid());
      }

      parent.onPaste(elementToPaste, textSelection);
    }
    // implement paste validation by element type. e.g. dtd validation
    // grab parent's supported elements and don't paste if element is
    // not in supported elements list (list does not contain item)

    // Only paste if a component is selected and cursor is not inside a contiguous text editor
    // This doesn't work if a CTE is selected, even if the cursor isn't inside the text. How
    // do we change it so that it detects whether cursor is in or out of the text?
  };
}
