import { combineReducers } from 'redux';

import { choices } from './choices';
import { course } from './course';
import { expanded } from './expanded';
import { messages } from './messages';
import { modal } from './modal';
import { objectives } from './objectives';
import { requests } from './requests';
import { server } from './server';
import { skills } from './skills';
import { user } from './user';

const reducers = combineReducers({
  choices,        // Supporting data for choices
  course,         // Information about current course
  expanded,       // preserves expaned state of tree UIs
  messages,       // Active application messages
  modal,          // modal display state
  objectives,     // The current learning objectives
  requests,       // the current pending async requests
  server,         // server specific info (time skew, etc)
  skills,         // all known skills for the current course
  user,           // Information about current user, null if not logged in
});

export default reducers;
