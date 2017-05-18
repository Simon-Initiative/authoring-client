import { EntityTypes } from '../data/content/html/common';

export type AuthoringActions = 
  toggleInlineStyleAction |
  insertAtomicBlockAction |
  toggleBlockTypeAction | 
  insertInlineEntityAction;

export interface AuthoringActionsHandler {
  handleAction(action: AuthoringActions);
}

export type TOGGLE_BLOCK_TYPE = 'TOGGLE_BLOCK_TYPE';
export const TOGGLE_BLOCK_TYPE : TOGGLE_BLOCK_TYPE = 'TOGGLE_BLOCK_TYPE';


export type TOGGLE_INLINE_STYLE = 'TOGGLE_INLINE_STYLE';
export const TOGGLE_INLINE_STYLE : TOGGLE_INLINE_STYLE = 'TOGGLE_INLINE_STYLE';

export type INSERT_ATOMIC_BLOCK = 'INSERT_ATOMIC_BLOCK';
export const INSERT_ATOMIC_BLOCK : INSERT_ATOMIC_BLOCK = 'INSERT_ATOMIC_BLOCK';

export type INSERT_INLINE_ENTITY = 'INSERT_INLINE_ENTITY';
export const INSERT_INLINE_ENTITY : INSERT_INLINE_ENTITY = 'INSERT_INLINE_ENTITY';

export type toggleBlockTypeAction = {
  type: TOGGLE_BLOCK_TYPE,
  blockType: string,
};

export type toggleInlineStyleAction = {
  type: TOGGLE_INLINE_STYLE,
  style: string,
};

export type insertAtomicBlockAction = {
  type: INSERT_ATOMIC_BLOCK,
  entityType: EntityTypes,
  data: Object,
};

export type insertInlineEntityAction = {
  type: INSERT_INLINE_ENTITY,
  entityType: string,
  mutability: string,
  data: Object,
};

export function insertAtomicBlock(entityType: EntityTypes, data: Object) : insertAtomicBlockAction {
  return {
    type: INSERT_ATOMIC_BLOCK,
    entityType,
    data,
  };
}

export function insertInlineEntity(
  entityType: string, mutability: string, 
  data: Object) : insertInlineEntityAction {
  return {
    type: INSERT_INLINE_ENTITY,
    entityType,
    mutability,
    data,
  };
}

export function toggleInlineStyle(style: string) : toggleInlineStyleAction {
  return {
    type: TOGGLE_INLINE_STYLE,
    style,
  };
}

export function toggleBlockType(blockType: string) : toggleBlockTypeAction {
  return {
    type: TOGGLE_BLOCK_TYPE,
    blockType,
  };
}
