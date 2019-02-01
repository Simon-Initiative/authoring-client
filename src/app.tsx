import 'babel-polyfill';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as persistence from './data/persistence';
import thunkMiddleware from 'redux-thunk';
import { applyMiddleware, createStore, Store, compose } from 'redux';
import 'whatwg-fetch';
import { initialize } from './actions/utils/keycloak';
import { configuration } from './actions/utils/config';
import { UserState } from './reducers/user';
import { getQueryVariable } from './utils/params';
import history from './utils/history';
import rootReducer, { State } from './reducers';
import { AppContainer } from 'react-hot-loader';
import initEditorRegistry from './editors/manager/registrar';
import { registerContentTypes } from 'data/registrar';
import { releaseAll } from 'actions/document';
import { ApplicationRoot } from './ApplicationRoot';
import { updateRoute } from 'actions/router';
import { registerStore } from 'utils/store';

// import application styles
import 'stylesheets/index.scss';
import 'react-tippy/dist/tippy.css';
import { Dispatch } from 'react-redux';

// attach global variables to window
(window as any).React = React;

// Redux devtool extension
// https://github.com/zalmoxisus/redux-devtools-extension
const composeEnhancers = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const nodeEnv = process.env.NODE_ENV;

const middleware = nodeEnv === 'production'
  ? applyMiddleware(thunkMiddleware)
  : composeEnhancers(applyMiddleware(thunkMiddleware));

function getPathName(pathname: string): string {
  return pathname.startsWith('/state') ? '' : pathname;
}

function initStoreWithState(state: Partial<State>) {
  const store = createStore(
    rootReducer, state, middleware,
  );

  return store;
}

function tryLogin(): Promise<UserState> {
  return new Promise<UserState>((resolve, reject) => {
    initialize(
      (profile, logoutUrl, accountManagementUrl) =>
        resolve({ profile, logoutUrl, user: profile.username, userId: profile.id }),
      err => reject(err),
      configuration.protocol + configuration.hostname);
  });
}

function render(store): Promise<boolean> {

  // Now do the initial rendering
  return new Promise((resolve, reject) => {
    ReactDOM.render(
      <AppContainer>
        <ApplicationRoot store={store} />
      </AppContainer>,
      document.getElementById('app'), () => resolve(true));
  });

}

function main() {
  // Application specific initialization
  initEditorRegistry();
  registerContentTypes();

  const redirectFragment = getQueryVariable('redirect_fragment');
  const fullPathname = redirectFragment ? redirectFragment : getPathName(history.location.pathname);
  const [pathname, search] = fullPathname.split('?');
  let store = null as Store<Partial<State>>;

  tryLogin()
    .then((user) => {
      store = initStoreWithState({
        user,
      });
      registerStore(store);
      store.dispatch(updateRoute(pathname, search));

      render(store);
    })
    .catch((err) => {
      const store = initStoreWithState({});
      registerStore(store);
      store.dispatch(updateRoute(pathname, search));

      render(store);
    });

  // respond to url changes
  history.listen(({ pathname, search }) => store.dispatch(updateRoute(pathname, search)));

  function clearHeldLocks() {
    return function (dispatch: Dispatch<State>, getState: () => State) {
      if (getState().locks.size > 0) {
        getState().locks
          .toArray()
          .forEach(({ courseId, documentId }) => persistence.releaseLock(courseId, documentId));
      }
    };
  }

  window.addEventListener('beforeunload', (event) => {
    if (store !== null) {
      store.dispatch(releaseAll());
      store.dispatch(clearHeldLocks());
    }
  });
}

main();
