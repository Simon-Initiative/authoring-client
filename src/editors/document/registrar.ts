
import WorkbookPageEditor from './workbook/WorkbookPageEditor';
import CourseEditor from './course/CourseEditor';

import { DeferredPersistenceStrategy } from './common/persistence/DeferredPersistenceStrategy';
import { ImmediatePersistenceStrategy } from './common/persistence/ImmediatePersistenceStrategy';
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