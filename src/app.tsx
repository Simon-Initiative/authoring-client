import 'babel-polyfill';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { getUserName } from './utils/params';

declare var require: {
    <T>(path: string): T;
    (paths: string[], callback: (...modules: any[]) => void): void;
    ensure: (paths: string[], callback: (require: <T>(path: string) => T) => void) => void;
};

import thunkMiddleware from 'redux-thunk';

var createLogger = require('redux-logger');

import { createStore, applyMiddleware } from 'redux';

import rootReducer from './reducers';
import 'whatwg-fetch';

interface RR {
    Provider: any;
}

var Provider = (require('react-redux') as RR).Provider;


const loggerMiddleware = (createLogger as any)();

const createStoreWithMiddleware = applyMiddleware(
  thunkMiddleware, // lets us dispatch async actions
  loggerMiddleware // middleware that logs actions
)(createStore);

//const store = createStoreWithMiddleware((rootReducer as <A extends Action>(state: any, action: A) => any));

const store = createStoreWithMiddleware(rootReducer);


import Main from './Main';

import initRegistry from './activity/registrar';
initRegistry();

import initEditorRegistry from './editors/registrar';
initEditorRegistry();


ReactDOM.render(
    <Provider store={store}>
      <Main username={getUserName()}/>
    </Provider>,
  document.getElementById('app')); // jshint ignore:line
