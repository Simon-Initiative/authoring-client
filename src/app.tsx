import 'babel-polyfill';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import thunkMiddleware from 'redux-thunk';
import { createStore, applyMiddleware } from 'redux';
import 'whatwg-fetch';

var Provider = (require('react-redux') as RR).Provider;
var createLogger = require('redux-logger');

import { getUserName } from './utils/params';
import rootReducer from './reducers';
import Main from './Main';
import initRegistry from './activity/registrar';
import initEditorRegistry from './editors/manager/registrar';

// Stylesheets
import './stylesheets/main.scss';

interface RR {
    Provider: any;
}

function initStore() {
  
  const loggerMiddleware = (createLogger as any)();

  const createStoreWithMiddleware = applyMiddleware(
    thunkMiddleware, // lets us dispatch async actions
    loggerMiddleware // middleware that logs actions
  )(createStore);

  return createStoreWithMiddleware(rootReducer);
}

function main() {

  // Application specific initialization
  initRegistry();
  initEditorRegistry();

  // Extract the user name from the query parameters
  const userName = getUserName();

  // Create the redux store
  const store = initStore();

  // Now do the initial rendering
  ReactDOM.render(
      <Provider store={store}>
        <Main username={userName}/>
      </Provider>, document.getElementById('app')); 
}

main();

