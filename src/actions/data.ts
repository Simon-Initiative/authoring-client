import {makeActionCreator} from './utils';

var fetch = (window as any).fetch;

import { viewActions } from './view';

import { translateDraftToContent } from '../components/translate';
import { EditorState } from 'draft-js';

const defaultContent = translateDraftToContent(EditorState.createEmpty().getCurrentContent());

const baseUrl = 'http://localhost:5984';

export module dataActions {
  export const PUBLISH_PAGES = 'PUBLISH_PAGES';
  export const PUBLISH_REV = 'PUBLISH_REV';
  export const PUBLISH_QUESTIONS = 'PUBLISH_QUESTIONS';
  export const PAGE_CREATED = 'PAGE_CREATED';
  export const QUESTION_CREATED = 'QUESTION_CREATED';
  export const PUBLISH_PAGE = 'PUBLISH_PAGE';
  
  export const publishPages = makeActionCreator(PUBLISH_PAGES, 'pages');
  export const publishQuestions = makeActionCreator(PUBLISH_QUESTIONS, 'questions');
  export const pageCreated = makeActionCreator(PAGE_CREATED, '_id', 'title');
  export const questionCreated = makeActionCreator(QUESTION_CREATED, '_id', 'stem');
  export const publishPage = makeActionCreator(PUBLISH_PAGE, 'content');
  export const publishRev = makeActionCreator(PUBLISH_REV, 'rev');
  

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

  export const fetchDocument = function(id) {
    return fetch(baseUrl + '/db/' + id)
      .then(r => r.json());
  }


  export const createPage = function(title) {

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

  export const createQuestion = function(stem) {

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

  export const setActivePage = function(id) {
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

  export const saveQuestion = function(content) {
    
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
