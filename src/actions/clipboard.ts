import { Maybe } from 'tsmonad';
import { saveToLocalStorage, loadFromLocalStorage } from 'utils/localstorage';
import { registeredTypes } from 'data/content/common/parse';
import guid from 'utils/guid';
import { ContiguousText } from 'data/content/learning/contiguous';
import { ContentElement } from 'data/content/common/interfaces';
import { ParentContainer } from 'types/active';
import { State } from 'reducers';
import { Dispatch } from 'redux';
import { validateRemoval } from 'data/models/utils/validation';
import { displayModalMessasge } from 'utils/message';
import { filter, map } from 'data/utils/map';
import { PasteFailModalElement } from 'components/PasteFailModalElement';
import * as React from 'react';
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
  return function (dispatch: Dispatch, getState: () => State) {
    const { activeContext, documents } = getState();

    // We will have to re-implement if we ever support multiple
    // concurrent document editing, as this simply just grabs the first
    // document

    if (validateRemoval(documents.first().document.model, item)) {
      dispatch(copy(item, page) as any);
      activeContext.container.lift(parent => parent.onRemove(item));
    } else {
      displayModalMessasge( // FIXME: actions should not have side effects. Should call "setState".
        dispatch,
        'Cutting this element would leave one or more command elements untargetted.');
    }

  };
}

export function copy(item: ContentElement, page: string) {
  let toSerialize = item.toPersistence();
  if (item.contentType === 'ContiguousText') {
    toSerialize = { isContiguousText: true, data: toSerialize };
  }
  const serialized = JSON.stringify(toSerialize);

  saveToLocalStorage('clipboard', serialized);

  return function (dispatch: Dispatch, getState: () => State) {
    dispatch(setItem(item, page));
  };
}

export function paste() {
  return function (dispatch: Dispatch, getState: () => State) {

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

      // Not all Element types can be copy/pasted
      const isSupported = activeContext.container.caseOf({
        just: parent => parent.supportedElements.contains(elementType),
        nothing: () => false,
      });
      if (isSupported) {

        // Remove any inline assessments or multipanels, as these would introduce
        // a duplicate inline - which breaks validation
        const filtered = filter(
          e => e.contentType !== 'WbInline' && e.contentType !== 'Multipanel', elementToPaste);

        const removed = [];

        map(
          (e) => {
            // Track which Content Types have been removed from the tree
            if (e.contentType === 'WbInline' || e.contentType === 'Multipanel') {
              if (!removed.includes(e.contentType)) {
                removed.push(e.contentType);
              }
            }
            return e;
          },
          elementToPaste);

        if (removed.length > 0) {
          const message = 'WARNING: the following content types can not be copied and pasted. '
                      + 'Please adjust your course accordingly.';

          // FIXME: actions should not have side effects. Should call "setState".
          displayModalMessasge(
            dispatch,
            React.createElement(PasteFailModalElement, {message, removed})
          );
        }

        parent.onPaste(filtered, textSelection);
      }
    }
  };
}
