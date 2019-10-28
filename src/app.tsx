import 'babel-polyfill';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as persistence from './data/persistence';
import thunkMiddleware from 'redux-thunk';
import { applyMiddleware, createStore, compose } from 'redux';
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
import { createLogger } from 'redux-logger';
import { Dispatch } from 'react-redux';

// import application styles
import 'stylesheets/index.scss';
import 'react-tippy/dist/tippy.css';

// attach global variables to window
(window as any).React = React;

// Redux devtool extension
// https://github.com/zalmoxisus/redux-devtools-extension
const composeEnhancers = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const nodeEnv = process.env.NODE_ENV;

let reduxLoggingEnabled = (window as Window).localStorage.getItem('redux-logging') === 'true';
(window as any).showReduxLogs = (show: boolean) => {
  reduxLoggingEnabled = !!show;
  (window as Window).localStorage.setItem('redux-logging', reduxLoggingEnabled ? 'true' : 'false');

  return reduxLoggingEnabled ? 'Redux logging enabled' : 'Redux logging disabled';
};

let experimentalOrgEditing = (window as Window)
  .localStorage.getItem('experimental-org-editing') === 'true';
(window as any).enableExperimentalOrgEditing = (show: boolean) => {
  experimentalOrgEditing = !!show;
  (window as Window).localStorage
    .setItem('experimental-org-editing', experimentalOrgEditing ? 'true' : 'false');

  return experimentalOrgEditing
    ? 'Experimental org editing enabled' : 'Experimental org editing disabled';
};

let prereqEditing = (window as Window)
  .localStorage.getItem('prereq-editing') === 'true';
(window as any).enablePrereqEditing = (show: boolean) => {
  prereqEditing = !!show;
  (window as Window).localStorage
    .setItem('prereq-editing', prereqEditing ? 'true' : 'false');

  return prereqEditing
    ? 'Page prerequisite editing enabled' : 'Page prerequisite editing disabled';
};

(window as any).help = () => {
  // tslint:disable-next-line:no-console
  console.log(`
Available Commands:
  enableExperimentalOrgEditing(enable: boolean)
    Enable experimental support for editing preconditions
  enablePrereqEditing(enable: boolean)
    Enable support for editing page prerequisites
  showReduxLogs(show: boolean)
    Enable redux logging if show is true, otherwise disable redux logging.
    Setting persists in local storage.
  help()
    Show available commands
  `);
};

const logger = createLogger({
  predicate: () => true,
});

const middleware = nodeEnv === 'production'
  ? applyMiddleware(thunkMiddleware, logger)
  : composeEnhancers(applyMiddleware(
    thunkMiddleware, logger,
  ));

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
  let store = null;

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
      const store: any = initStoreWithState({});
      registerStore(store);
      store.dispatch(updateRoute(pathname, search));

      render(store);
    });

  // respond to url changes
  history.listen(({ pathname, search }) => {
    // ignore paths that start with /state
    if (pathname && pathname.startsWith('/state')) return;

    store.dispatch(updateRoute(pathname, search));
  });

  function clearHeldLocks() {
    return function (dispatch: Dispatch<State>, getState: () => State) {
      if (getState().locks.size > 0) {
        getState().locks
          .toArray()
          .forEach(({ courseId, documentId }) =>
            persistence.releaseLock(courseId, documentId));
      }
    };
  }

  window.addEventListener('beforeunload', (event) => {
    if (store !== null) {
      store.dispatch(releaseAll() as any);
      store.dispatch(clearHeldLocks() as any);
    }
  });
}

main();
