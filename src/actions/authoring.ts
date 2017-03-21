

export type AuthoringActions = 
  toggleInlineStyleAction |
  insertActivityAction |
  toggleBlockTypeAction

export interface AuthoringActionsHandler {
  handleAction(action: AuthoringActions);
}

export type TOGGLE_BLOCK_TYPE = 'TOGGLE_BLOCK_TYPE';
export const TOGGLE_BLOCK_TYPE : TOGGLE_BLOCK_TYPE = 'TOGGLE_BLOCK_TYPE';


export type TOGGLE_INLINE_STYLE = 'TOGGLE_INLINE_STYLE';
export const TOGGLE_INLINE_STYLE : TOGGLE_INLINE_STYLE = 'TOGGLE_INLINE_STYLE';

export type INSERT_ACTIVITY = 'INSERT_ACTIVITY';
export const INSERT_ACTIVITY : INSERT_ACTIVITY = 'INSERT_ACTIVITY';

export type toggleBlockTypeAction = {
  type: TOGGLE_BLOCK_TYPE,
  blockType: string 
}

export type toggleInlineStyleAction = {
  type: TOGGLE_INLINE_STYLE,
  style: string
};

export type insertActivityAction = {
  type: INSERT_ACTIVITY,
  activityType: string,
  data: Object
};

export function insertActivity(activityType: string, data: Object) : insertActivityAction {
  return {
    type: INSERT_ACTIVITY,
    activityType,
    data
  }
}

export function toggleInlineStyle(style: string) : toggleInlineStyleAction {
  return {
    type: TOGGLE_INLINE_STYLE,
    style
  }
}

export function toggleBlockType(blockType: string) : toggleBlockTypeAction {
  return {
    type: TOGGLE_BLOCK_TYPE,
    blockType
  }
}



