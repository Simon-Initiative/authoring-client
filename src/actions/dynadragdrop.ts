export type SELECT_INITIATOR = 'dynadragdrop/SELECT_INITIATOR';
export const SELECT_INITIATOR: SELECT_INITIATOR = 'dynadragdrop/SELECT_INITIATOR';

export type SelectInitiatorAction = {
  type: SELECT_INITIATOR,
  guid: string,
};

export const selectInitiator = (guid: string): SelectInitiatorAction => ({
  type: SELECT_INITIATOR,
  guid,
});


export type CLEAR_INITIATOR = 'dynadragdrop/CLEAR_INITIATOR';
export const CLEAR_INITIATOR: CLEAR_INITIATOR = 'dynadragdrop/CLEAR_INITIATOR';

export type ClearInitiatorAction = {
  type: CLEAR_INITIATOR,
};

export const clearInitiator = (): ClearInitiatorAction => ({
  type: CLEAR_INITIATOR,
});
