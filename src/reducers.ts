import { combineReducers } from 'redux';

import { user } from './reducers/user';
import { course } from './reducers/course';
import { modal } from './reducers/modal';
import { requests } from './reducers/requests';
import { expanded } from './reducers/expanded';
import { server } from './reducers/server';
import { skills } from './reducers/skills';
import { objectives } from './reducers/objectives';
import { messages } from './reducers/messages';

const reducers = combineReducers({
  user,           // Information about current user, null if not logged in
  course,         // Information about current course
  modal,          // modal display state
  requests,       // the current pending async requests
  expanded,       // preserves expaned state of tree UIs
  server,         // server specific info (time skew, etc)
  skills,         // all known skills for the current course
  objectives,     // The current learning objectives
  messages,       // Active application messages
});

export default reducers;
