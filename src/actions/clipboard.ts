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
    dispatch(copy(item));
    activeContext.container.lift(parent => parent.onRemove(item));
  };
}
export function copy(item) {
  return function (dispatch, getState) {
    const { activeContext }: { activeContext: ActiveContextState } = getState();

    let toSerialize = item.toPersistence();
    if (item.contentType === 'ContiguousText') {
      toSerialize = { isContiguousText: true, data: toSerialize };
    }
    const serialized = JSON.stringify(toSerialize);

    activeContext.activeChild.lift(selection => saveToLocalStorage('clipboard', serialized));
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
      let elementType = Object.keys(savedData)[0];
      // ContiguousText components serialize to lists of inline elements (e.g. 'p' tags),
      // so we handle that case separately
      if (savedData.isContiguousText) {
        elementToPaste = ContiguousText.fromPersistence(savedData.data, guid());
        elementType = '#text';
        // Otherwise, we look up the fromPersistence method from the data wrapper registry
      } else {
        const factoryFn = registeredTypes[elementType];
        elementToPaste = factoryFn(savedData, guid());
      }

      const isSupported = activeContext.container.caseOf({
        just: parent => parent.supportedElements.contains(elementType),
        nothing: () => false,
      });
      if (isSupported) {
        parent.onPaste(elementToPaste, textSelection);
      }
    }
    // implement paste validation by element type. e.g. dtd validation
    // grab parent's supported elements and don't paste if element is
    // not in supported elements list (list does not contain item)

    // Only paste if a component is selected and cursor is not inside a contiguous text editor
    // This doesn't work if a CTE is selected, even if the cursor isn't inside the text. How
    // do we change it so that it detects whether cursor is in or out of the text?
  };
}
