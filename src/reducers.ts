import { combineReducers } from 'redux';

import { user } from './reducers/user';
import { courses } from './reducers/courses';
import { document } from './reducers/document';
import { modal } from './reducers/modal';
import { requests } from './reducers/requests';

const reducers = combineReducers({
  user,           // Information about current user, null if not logged in
  courses,        // Array of available course ids for current user
  document,       // The currently viewed document id, null if none
  modal,          // modal display state
  requests        // the current pending async requests
});

export default reducers;