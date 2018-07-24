import { combineReducers } from 'redux';

import { choices, ChoicesState } from 'reducers/choices';
import { course, CourseState } from 'reducers/course';
import { discoverable, DiscoverableState } from 'reducers/discoverable';
import { dynadragdrop, DynaDragDropState } from 'reducers/dynadragdrop';
import { editorSidebar, EditorSidebarState } from 'reducers/editorSidebar';
import { expanded, ExpandedState } from 'reducers/expanded';
import { hover, HoverState } from 'reducers/hover';
import { locks, LocksState } from 'reducers/locks';
import { media, MediaState } from 'reducers/media';
import { messages, MessageState } from 'reducers/messages';
import { modal, ModalState } from 'reducers/modal';
import { objectives, ObjectiveState } from 'reducers/objectives';
import { requests, RequestsState } from 'reducers/requests';
import { server, ServerState } from 'reducers/server';
import { skills, SkillsState } from 'reducers/skills';
import { user, UserState } from 'reducers/user';
import { questionEditor, QuestionEditorState } from 'reducers/questionEditor';
import { documents, DocumentsState } from 'reducers/documents';
import { activeContext, ActiveContextState } from 'reducers/active';
import { clipboard, ClipboardState } from 'reducers/clipboard';
import { XrefState, xref } from 'reducers/xref';

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
  xref: XrefState;
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
  xref,           // The target element in a cross reference
});

export default reducers;
