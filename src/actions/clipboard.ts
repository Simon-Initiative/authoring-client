import { Maybe } from 'tsmonad';
import { saveToLocalStorage, loadFromLocalStorage } from 'utils/localstorage';
import { registeredTypes } from 'data/content/common/parse';
import guid from 'utils/guid';
import { ContiguousText } from 'data/content/learning/contiguous';
import { ContentElement } from 'data/content/common/interfaces';
import { ParentContainer } from 'types/active';
import { State } from 'reducers';
import { Dispatch } from 'redux';

export type SET_ITEM = 'clipboard/SET_ITEM';
export const SET_ITEM: SET_ITEM = 'clipboard/SET_ITEM';

export type SetItemAction = {
  type: SET_ITEM;
  item: Maybe<ContentElement>;
  page: Maybe<string>;
};

export const setItem = (item: ContentElement, page: string): SetItemAction => ({
  type: SET_ITEM,
  item: Maybe.just(item),
  page: Maybe.just(page),
});

export function cut(item: ContentElement, page: string) {
  return function (dispatch: Dispatch<State>, getState: () => State) {
    const { activeContext } = getState();
    dispatch(copy(item, page));
    activeContext.container.lift(parent => parent.onRemove(item));
  };
}

export function copy(item: ContentElement, page: string) {
  let toSerialize = item.toPersistence();
  if (item.contentType === 'ContiguousText') {
    toSerialize = { isContiguousText: true, data: toSerialize };
  }
  const serialized = JSON.stringify(toSerialize);

  saveToLocalStorage('clipboard', serialized);

  return function (dispatch: Dispatch<State>, getState: () => State) {
    dispatch(setItem(item, page));
  };
}

export function paste() {
  return function (dispatch: Dispatch<State>, getState: () => State) {

    const { activeContext } = getState();

    activeContext.container.lift(parent => pasteInside(parent));

    function pasteInside(parent: ParentContainer) {
      const savedData: any = loadFromLocalStorage('clipboard');
      if (savedData === null) {
        return;
      }

      const { textSelection } = activeContext;
      let elementToPaste: ContentElement;
      let elementType: string;
      // ContiguousText components serialize to lists of inline elements (e.g. 'p' tags),
      // so we handle that case separately
      if (savedData.isContiguousText) {
        elementType = '#text';
        elementToPaste = ContiguousText.fromPersistence(savedData.data, guid());
      } else {
        // Otherwise, we look up the fromPersistence method from the data wrapper registry
        elementType = Object.keys(savedData)[0];
        const factoryFn: (obj, guid) => ContentElement = registeredTypes[elementType];
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
  };
}
