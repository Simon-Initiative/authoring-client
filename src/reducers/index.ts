import { combineReducers } from 'redux';

import { choices, ChoicesState } from './choices';
import { course, CourseState } from './course';
import { discoverable, DiscoverableState } from './discoverable';
import { dynadragdrop, DynaDragDropState } from './dynadragdrop';
import { editorSidebar, EditorSidebarState } from './editorSidebar';
import { expanded, ExpandedState } from './expanded';
import { hover, HoverState } from './hover';
import { locks, LocksState } from './locks';
import { media, MediaState } from './media';
import { messages, MessageState } from './messages';
import { modal, ModalState } from './modal';
import { objectives, ObjectiveState } from './objectives';
import { requests, RequestsState } from './requests';
import { server, ServerState } from './server';
import { skills, SkillsState } from './skills';
import { user, UserState } from './user';
import { questionEditor, QuestionEditorState } from './questionEditor';
import { documents, DocumentsState } from './documents';
import { activeContext, ActiveContextState } from './active';
import { clipboard, ClipboardState } from './clipboard';

export interface State {
  activeContext: ActiveContextState;
  documents: DocumentsState;
  choices: ChoicesState;
  course: CourseState;
  discoverable: DiscoverableState;
  dynadragdrop: DynaDragDropState;
  editorSidebar: EditorSidebarState;
  expanded: ExpandedState;
  hover: HoverState;
  locks: LocksState;
  media: MediaState;
  messages: MessageState;
  modal: ModalState;
  objectives: ObjectiveState;
  requests: RequestsState;
  server: ServerState;
  skills: SkillsState;
  user: UserState;
  questionEditor: QuestionEditorState;
  clipboard: ClipboardState;
}

const reducers = combineReducers({
  activeContext,  // The active editing context - aka: what is being edited
  documents,      // The current state and models of documents under edit
  choices,        // Supporting data for choices
  course,         // Information about current course
  discoverable,   // Global discoverable events
  dynadragdrop,   // DynaDrop Drag and Drop
  editorSidebar,  // Editor sidebar state
  expanded,       // preserves expaned state of tree UIs
  hover,          // content hover state
  locks,          // The current, registered document locks
  media,          // Course media state
  messages,       // Active application messages
  modal,          // modal display state
  objectives,     // The current learning objectives
  requests,       // the current pending async requests
  server,         // server specific info (time skew, etc)
  skills,         // all known skills for the current course
  user,           // Information about current user, null if not logged in
  questionEditor,
  clipboard,      // Native clipboard state and cut/copy/paste actions
});

export default reducers;
