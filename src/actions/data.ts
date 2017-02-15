import {makeActionCreator} from './utils';

var fetch = (window as any).fetch;

import { viewActions } from './view';

import { translateDraftToContent } from '../components/translate';
import { EditorState } from 'draft-js';

const defaultContent = translateDraftToContent(EditorState.createEmpty().getCurrentContent());

const baseUrl = 'http://localhost:5984';

export module dataActions {


  export type PUBLISH_PAGES = 'PUBLISH_PAGES';
  export const PUBLISH_PAGES : PUBLISH_PAGES = 'PUBLISH_PAGES';
  export type PUBLISH_REV = 'PUBLISH_REV';
  export const PUBLISH_REV : PUBLISH_REV = 'PUBLISH_REV';
  export type PUBLISH_QUESTIONS = 'PUBLISH_QUESTIONS';
  export const PUBLISH_QUESTIONS : PUBLISH_QUESTIONS = 'PUBLISH_QUESTIONS';
  export type PAGE_CREATED = 'PAGE_CREATED';
  export const PAGE_CREATED : PAGE_CREATED = 'PAGE_CREATED';
  export type QUESTION_CREATED = 'QUESTION_CREATED';
  export const QUESTION_CREATED : QUESTION_CREATED = 'QUESTION_CREATED';
  export type PUBLISH_PAGE = 'PUBLISH_PAGE';
  export const PUBLISH_PAGE : PUBLISH_PAGE = 'PUBLISH_PAGE';
  
  export type Page = {
    _id: string,
    _rev: string,
    title: string,
    type: string,
    entityMap: any,
    blocks: any
  }

  export type PageSummary = {
    _id: string,
    _rev: string,
    title: string
  }

  export type publishPagesAction = {
    type: PUBLISH_PAGES,
    pages: PageSummary[]
  }

  export function publishPages(pages: PageSummary[]) : publishPagesAction {
    return {
      type: PUBLISH_PAGES,
      pages
    }
  }

  export type QuestionSummary = {
    _id: string,
    _rev: string,
    stem: string
  }

  export type publishQuestionsAction = {
    type: PUBLISH_QUESTIONS,
    questions: QuestionSummary[]
  }

  export function publishQuestions(questions: QuestionSummary[]) : publishQuestionsAction {
    return {
      type: PUBLISH_QUESTIONS,
      questions
    }
  }

  export type pageCreatedAction = {
    type: PAGE_CREATED,
    _id: string,
    title: string 
  }

  export function pageCreated(_id: string, title: string) : pageCreatedAction {
    return {
      type: PAGE_CREATED,
      _id,
      title
    }
  }

  export type questionCreatedAction = {
    type: QUESTION_CREATED,
    _id: string,
    stem: string
  }

  export function questionCreated(_id: string, stem: string): questionCreatedAction {
    return {
      type: QUESTION_CREATED,
      _id,
      stem
    }
  }

  export type publishPageAction = {
    type: PUBLISH_PAGE,
    content: Page
  }

  export function publishPage(content: Page) : publishPageAction {
    return {
      type: PUBLISH_PAGE,
      content
    }
  }

  export type publishRevAction = {
    type: PUBLISH_REV,
    rev: string
  }

  export function publishRev(rev: string) : publishRevAction {
    return {
      type: PUBLISH_REV,
      rev
    }
  }


  export const fetchPages = function() {
    return function(dispatch) {

      let query = {
        selector: {
          type: {'$eq': 'page'}
        },
        fields: ["_id", "title"]
      }

      fetch(baseUrl + '/db/_find', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(query)
      })
      .then(response => {
        return response.json()
      })
      .then(json => {
        dispatch(publishPages(json.docs))
      });
    }
  }

  export const fetchQuestions = function() {
    return function(dispatch) {

      let query = {
        selector: {
          type: {'$eq': 'tf'}
          
        },
        fields: ["_id", "stem"]
      }

      fetch(baseUrl + '/db/_find', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(query)
      })
      .then(response => {
        console.log(response);
        return response.json()
      })
      .then(json => {
        console.log(json);
        dispatch(publishQuestions(json.docs))
      });
    
    }
  }

  export const fetchDocument = function(id: string) {
    return fetch(baseUrl + '/db/' + id)
      .then(r => r.json());
  }


  export const createPage = function(title: string) {

    let content = Object.assign({}, defaultContent, { title, type: 'page' });

    return function(dispatch) {

      fetch(baseUrl + '/db', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(content)
      })
      .then(response => response.json())
      .then(json => dispatch(pageCreated(json.id, content.title)))
      .catch(e => console.log(e));
    }
  }

  export const createQuestion = function(stem: string) {

    let content = Object.assign({}, { stem, type: 'tf', answer: true });

    return function(dispatch) {

      fetch(baseUrl + '/db', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(content)
      })
      .then(response => response.json())
      .then(json => dispatch(questionCreated(json.id, content.stem)))
      .catch(e => console.log(e));
    }
  }

  export const setActivePage = function(id: string) {
    return function(dispatch) {
      fetchDocument(id)
        .then(json => {
          dispatch(publishPage(json));
          dispatch(viewActions.changeView('page'));
        });
    }
  }

  export const savePage = function(content) {
    return function(dispatch) {
      fetch(baseUrl + '/db/' + content._id, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(content)
      })
      .then(result => result.json())
      .then(json => {
        dispatch(publishRev(json.rev));
      });
    }
  }

  export type QuestionContent = {
    _id: string,
    _rev: string
  }
  export const saveQuestion = function(content: QuestionContent) {
    
    return fetch(baseUrl + '/db/' + content._id, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(content)
    })
    .then(result => result.json())
    
  }


  
}
