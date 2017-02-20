import { combineReducers } from 'redux';

import { user } from './reducers/user';
import { courses } from './reducers/courses';
import { document } from './reducers/document';
import { modal } from './reducers/modal';
import { requests } from './reducers/requests';

const reducers = combineReducers({
  user,           // Information about current user, null if not logged insertActivityAction
  courses,        // Available courses
  document,       // The currently viewed document, null if none
  modal,          // modal display state
  requests        // the current pending async requests
});

export default reducers;