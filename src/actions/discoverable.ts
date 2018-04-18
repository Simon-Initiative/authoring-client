import { DiscoverableId } from 'types/discoverable';

export type DISCOVER = 'discoverable/DISCOVER';
export const DISCOVER: DISCOVER = 'discoverable/DISCOVER';

export type DiscoverAction = {
  type: DISCOVER,
  id: DiscoverableId,
};

export const discover = (id: DiscoverableId) =>
  (dispatch, getState) => {
    dispatch({
      type: DISCOVER,
      id,
    });

    setTimeout(() => dispatch(clearDiscover()), 1000);
  };

export type CLEAR_DISCOVER = 'discoverable/CLEAR_DISCOVER';
export const CLEAR_DISCOVER: CLEAR_DISCOVER = 'discoverable/CLEAR_DISCOVER';

export type ClearDiscoverAction = {
  type: CLEAR_DISCOVER,
};

export const clearDiscover = (): ClearDiscoverAction => ({
  type: CLEAR_DISCOVER,
});
