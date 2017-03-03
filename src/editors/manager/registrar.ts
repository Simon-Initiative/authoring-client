
import WorkbookPageEditor from '../document/workbook/WorkbookPageEditor';
import CourseEditor from '../document/course/CourseEditor';

import { DeferredPersistenceStrategy } from './persistence/DeferredPersistenceStrategy';
import { ImmediatePersistenceStrategy } from './persistence/ImmediatePersistenceStrategy';
import { ListeningApproach } from './ListeningApproach';

import { ModelTypes } from '../../data/models';
import { register } from './registry';

export default function initEditorRegistry() {
  register({
    name: ModelTypes.WorkbookPageModel, 
    component: WorkbookPageEditor, 
    persistenceStrategy: new DeferredPersistenceStrategy(),
    listeningApproach: ListeningApproach.WhenReadOnly
  });
  register({
    name: ModelTypes.CourseModel, 
    component: CourseEditor,
    persistenceStrategy: new ImmediatePersistenceStrategy(),
    listeningApproach: ListeningApproach.Never
  });
}