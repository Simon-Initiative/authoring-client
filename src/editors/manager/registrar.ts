
import WorkbookPageEditor from '../document/workbook/WorkbookPageEditor';
import AssessmentEditor from '../document/assessment/AssessmentEditor';
import CourseEditor from '../document/course/CourseEditor';
import OrganizationEditor from '../document/organization/OrganizationEditor';

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
    listeningApproach: ListeningApproach.WhenReadOnly,
    protected: true
  });
  register({
    name: ModelTypes.CourseModel, 
    component: CourseEditor,
    persistenceStrategy: new ImmediatePersistenceStrategy(),
    listeningApproach: ListeningApproach.Never,
    protected: false
  });
  register({
    name: ModelTypes.AssessmentModel, 
    component: AssessmentEditor,
    persistenceStrategy: new DeferredPersistenceStrategy(),
    listeningApproach: ListeningApproach.WhenReadOnly,
    protected: true
  });  
  register({
    name: ModelTypes.OrganizationModel, 
    component: OrganizationEditor,
    persistenceStrategy: new DeferredPersistenceStrategy(),
    listeningApproach: ListeningApproach.WhenReadOnly,
    protected: true
  });   
}
