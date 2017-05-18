import { combineReducers } from 'redux';

import { user } from './reducers/user';
import { course } from './reducers/course';
import { view } from './reducers/view';
import { modal } from './reducers/modal';
import { requests } from './reducers/requests';

const reducers = combineReducers({
  user,           // Information about current user, null if not logged in
  course,         // Information about current course, null if no current course
  view,           // The current view
  modal,          // modal display state
  requests,        // the current pending async requests
});

export default reducers;
