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

    const { activeContext }: { activeContext: ActiveContextState } = getState();

    activeContext.container.lift(parent => pasteInside(parent));

    function pasteInside(parent) {
      const savedData: any = loadFromLocalStorage('clipboard');
      if (savedData === null) {
        return;
      }

      const { textSelection } = activeContext;
      let elementToPaste;
      let elementType;
      // ContiguousText components serialize to lists of inline elements (e.g. 'p' tags),
      // so we handle that case separately
      if (savedData.isContiguousText) {
        elementToPaste = ContiguousText.fromPersistence(savedData.data, guid());
        elementType = '#text';
        // Otherwise, we look up the fromPersistence method from the data wrapper registry
      } else {
        const factoryFn = registeredTypes[elementType];
        elementToPaste = factoryFn(savedData, guid());
        elementType = Object.keys(savedData)[0];
      }

      const isSupported = activeContext.container.caseOf({
        just: parent => parent.supportedElements.contains(elementType),
        nothing: () => false,
      });
      if (isSupported) {
        parent.onPaste(elementToPaste, textSelection);
      }
    }
  };
}
