import { combineReducers } from 'redux';

import { user } from './reducers/user';
import { courses } from './reducers/courses';
import { view } from './reducers/view';
import { modal } from './reducers/modal';
import { requests } from './reducers/requests';

const reducers = combineReducers({
  user,           // Information about current user, null if not logged in
  courses,        // Array of available course ids for current user
  view,           // The current view
  modal,          // modal display state
  requests        // the current pending async requests
});

export default reducers;