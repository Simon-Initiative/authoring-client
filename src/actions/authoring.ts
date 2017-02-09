import {makeActionCreator} from './utils';

export module authoring {

  export const TOGGLE_INLINE_STYLE = 'TOGGLE_INLINE_STYLE';
  export const INSERT_ACTIVITY = 'INSERT_ACTIVITY';

  export const toggleInlineStyle = makeActionCreator(TOGGLE_INLINE_STYLE, 'style');
  export const insertActivity = makeActionCreator(INSERT_ACTIVITY, 'activityType', 'data');
}



