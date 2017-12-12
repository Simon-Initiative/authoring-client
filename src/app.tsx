import 'babel-polyfill';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Iterable } from 'immutable';
import * as persistence from './data/persistence';
import * as models from './data/models';
import thunkMiddleware from 'redux-thunk';
import { createStore, applyMiddleware, Store } from 'redux';
import 'whatwg-fetch';
import { initialize } from './actions/utils/keycloak';
import { configuration } from './actions/utils/config';
import {} from 'node';
import { createLogger } from 'redux-logger';
import { UserInfo } from './reducers/user';
import { getUserName, getQueryVariable } from './utils/params';
import history from './utils/history';
import rootReducer from './reducers';
import { loadCourse } from 'actions/course';
import Main from './Main.controller';
import { AppContainer } from 'react-hot-loader';
import initRegistry from './editors/content/common/draft/renderers/registrar';
import initEditorRegistry from './editors/manager/registrar';
import { courseChanged } from './actions/course';

import { ApplicationRoot } from './ApplicationRoot';

// attach global variables to window
(window as any).React = React;

// import application styles
import 'stylesheets/index.scss';

const loggerMiddleware = (createLogger as any)({
  stateTransformer: (state) => {
    const newState = {};

    // if state item is immutable, convert to JS for logging purposes
    for (const i of Object.keys(state)) {
      if (Iterable.isIterable(state[i])) {
        newState[i] = state[i].toJS();
      } else {
        newState[i] = state[i];
      }
    }

    return newState;
  },
});

function initStoreWithState(state) {
  const store = createStore(
    rootReducer, state,
    applyMiddleware(thunkMiddleware, loggerMiddleware),
  );

  if ((module as any).hot) {
    // Enable Webpack hot module replacement for reducers
    (module as any).hot.accept('./reducers', () => {
      const nextRootReducer = require('./reducers');
      store.replaceReducer(nextRootReducer);
    });
  }

  return store;
}

function historyRequiresCourseLoad() {
  return window.location.hash !== ''
    && window.location.hash.indexOf('-') !== -1;
}

function tryLogin() : Promise<UserInfo> {
  return new Promise<UserInfo>((resolve, reject) => {
    initialize(
      (profile, logoutUrl, accountManagementUrl) =>
        resolve({ profile, logoutUrl, user: profile.username, userId: profile.id }),
      err => reject(err),
      configuration.protocol + configuration.hostname);
  });
}

function render(store, current) : Promise<boolean> {

  // Now do the initial rendering
  return new Promise((resolve, reject) => {
    ReactDOM.render(
      <AppContainer>
        <CurrentApplicationRoot store={store} location={current}/>
      </AppContainer>,
      document.getElementById('app'), () => resolve(true));
  });

}


let store : Store<any> = null;
let CurrentApplicationRoot = ApplicationRoot;

function main() {
  // Application specific initialization
  initRegistry();
  initEditorRegistry();

  let userInfo = null;

  const redirectFragment = getQueryVariable('redirect_fragment');
  const current = {
    hash: '',
    pathname: '/' + (redirectFragment === null ? '' : redirectFragment),
    search: '',
  };

  tryLogin()
    .then((user) => {

      store = initStoreWithState({ user });

      // initialize user data
      if (historyRequiresCourseLoad()) {

        const hash = window.location.hash;
        const courseId = hash.substr(hash.indexOf('-') + 1);

        userInfo = user;
        return store.dispatch(loadCourse(courseId));
      }
      render(store, current);

    })
    .then((model) => {
      render(store, current);
    })
    .catch((err) => {
      render(initStoreWithState({ user: userInfo }), current);
    });

}

main();

history.listen((current) => {

  render(store, current)
    .then(result => window.scrollTo(0, 0));
});

if ((module as any).hot) {
  (module as any).hot.accept('./ApplicationRoot', () => {
    CurrentApplicationRoot = require('./ApplicationRoot').ApplicationRoot;

    render(store, window.location);
  });
}
