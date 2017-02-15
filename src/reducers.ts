
import { combineReducers } from 'redux';

export type OtherAction = { type: '' };
export const OtherAction : OtherAction = { type: '' };
    
import { authoringActions } from './actions/authoring';
import { dataActions } from './actions/data';
import { modalActions } from './actions/modal';
import { viewActions } from './actions/view';


type ContentAction = 
  dataActions.publishPageAction |
  dataActions.publishRevAction |
  OtherAction

function content(state = { rev: null, content: null}, action: ContentAction): Object {
  switch(action.type) {
  case dataActions.PUBLISH_PAGE:
    return { rev: action.content._rev, content: action.content};
  case dataActions.PUBLISH_REV:
    return { rev: action.rev, content: state.content};
  default:
    return state;
  }
}

type PagesAction = 
  dataActions.publishPagesAction |
  dataActions.pageCreatedAction |
  OtherAction

function pages(state = [], action: PagesAction): Object[] {
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

type QuestionsActions =
  dataActions.publishQuestionsAction |
  dataActions.questionCreatedAction |
  OtherAction

function questions(state = [], action: QuestionsActions): Object[] {
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

type EditAction =
    authoringActions.insertActivityAction |
    authoringActions.toggleInlineStyleAction |
    OtherAction

function editHistory(state = [], action: EditAction = OtherAction): Object[] {
  switch(action.type) {
  case authoringActions.INSERT_ACTIVITY:
  case authoringActions.TOGGLE_INLINE_STYLE:
    return [action, ...state];
  default:
    return state;
  }
  
}

type ModalActions = 
  modalActions.dismissAction |
  modalActions.displayAction |
  OtherAction

function modal(state = null, action: ModalActions): Object[] {
  switch(action.type) {
  case modalActions.DISMISS_MODAL:
    return null;
  case modalActions.DISPLAY_MODAL:
    return action.component;
  default:
    return state;
  }
}

type ViewActions =
  viewActions.changeViewAction |
  OtherAction

function view(state : viewActions.View = "allPages", action: ViewActions): viewActions.View {
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
