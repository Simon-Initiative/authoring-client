import { DiscoverableId } from 'types/discoverable';

export type DISCOVER = 'discoverable/DISCOVER';
export const DISCOVER: DISCOVER = 'discoverable/DISCOVER';

export type DiscoverAction = {
  type: DISCOVER,
  id: DiscoverableId,
};

export const discover = (id: DiscoverableId): DiscoverAction => ({
  type: DISCOVER,
  id,
});
