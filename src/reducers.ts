
import { combineReducers } from 'redux';

import { authoring } from './actions/authoring';
import { dataActions } from './actions/data';
import { modalActions } from './actions/modal';
import { viewActions } from './actions/view';

function content(state = { rev: null, content: null}, action): Object {
  switch(action.type) {
  case dataActions.PUBLISH_PAGE:
    return { rev: action.content._rev, content: action.content};
  case dataActions.PUBLISH_REV:
    return { rev: action.rev, content: state.content};
  default:
    return state;
  }
}


function pages(state = [], action): Object[] {
  switch(action.type) {
  case dataActions.PUBLISH_PAGES:
    return action.pages;
  case dataActions.PAGE_CREATED:
    const {_id, title} = action;
    return [...state, {_id, title}];
  default:
    return state;
  }
}

function questions(state = [], action): Object[] {
  switch(action.type) {
  case dataActions.PUBLISH_QUESTIONS:
    return action.questions;
  case dataActions.QUESTION_CREATED:
    const {_id, stem} = action;
    return [...state, {_id, stem}];
  default:
    return state;
  }
}

function editHistory(state = [], action): Object[] {
  switch(action.type) {
  case authoring.TOGGLE_INLINE_STYLE:
  case authoring.INSERT_ACTIVITY:
    return [action, ...state];
  default:
    return state;
  }
  
}

function modal(state = null, action): Object[] {
  switch(action.type) {
  case modalActions.DISMISS_MODAL:
    return null;
  case modalActions.DISPLAY_MODAL:
    return action.component;
  default:
    return state;
  }
}

function view(state : viewActions.View = "allPages", action): viewActions.View {
  switch(action.type) {
  case viewActions.CHANGE_VIEW:
    return action.view;
  default:
    return state;
  }
}

const reducers = combineReducers({
  view,         // Which top level view the user is looking at
  content,      // Page contents for viewed page
  pages,        // { _id, title } array for all pages
  editHistory,  // running log of editing actions
  modal,        // modal display state
  questions     // { _id, stem } array of all questions
});


export default reducers;
