

// Actions that can be dispatched at the start and completion of
// a long running async operation.  This largely is used to power
// an application level 'waiting' indicator to let the user know
// that something is happening in the background.  
export module requestActions {

  export type START_REQUEST = 'START_REQUEST';
  export const START_REQUEST : START_REQUEST = 'START_REQUEST';
 
  export type END_REQUEST = 'END_REQUEST';
  export const END_REQUEST : END_REQUEST = 'END_REQUEST';

 
  export type startRequestAction = {
    type: START_REQUEST,
    id: string,
    description: string,
    timestamp: Date,
  };

  export function startRequest(id: string, description: string) : startRequestAction {
    return {
      type: START_REQUEST,
      id,
      description,
      timestamp: new Date(),
    };
  }

  export type endRequestAction = {
    type: END_REQUEST,
    id: string,
  };

  export function endRequest(id: string) : endRequestAction {
    return {
      type: END_REQUEST,
      id,
    };
  }

}
