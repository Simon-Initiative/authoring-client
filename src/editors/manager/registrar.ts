import WorkbookPageEditor from 'editors/document/workbook/WorkbookPageEditor.controller';
import AssessmentEditor from 'editors/document/assessment/AssessmentEditor.controller';
import CourseEditor from 'editors/document/course/CourseEditor.controller';
import OrgEditor from 'editors/document/org/OrgEditor.controller';
import PoolEditor from 'editors/document/pool/PoolEditor.controller';

import { DeferredPersistenceStrategy }
  from 'editors/manager/persistence/DeferredPersistenceStrategy';
import { ImmediatePersistenceStrategy }
  from 'editors/manager/persistence/ImmediatePersistenceStrategy';
import { ListeningApproach } from 'editors/manager/ListeningApproach';

import { ModelTypes } from 'data/models';
import { register } from 'editors/manager/registry';

export default function initEditorRegistry() {
  register({
    name: ModelTypes.WorkbookPageModel,
    component: WorkbookPageEditor,
    persistenceStrategyFactory: () => new DeferredPersistenceStrategy(),
    listeningApproach: ListeningApproach.WhenReadOnly,
    protected: true,
  });
  register({
    name: ModelTypes.CourseModel,
    component: CourseEditor,
    persistenceStrategyFactory: () => new ImmediatePersistenceStrategy(),
    listeningApproach: ListeningApproach.Never,
    protected: false,
  });
  register({
    name: ModelTypes.AssessmentModel,
    component: AssessmentEditor,
    persistenceStrategyFactory: () => new DeferredPersistenceStrategy(),
    listeningApproach: ListeningApproach.WhenReadOnly,
    protected: true,
  });
  register({
    name: ModelTypes.OrganizationModel,
    component: OrgEditor,
    persistenceStrategyFactory: () => new DeferredPersistenceStrategy(),
    listeningApproach: ListeningApproach.WhenReadOnly,
    protected: true,
  });
  register({
    name: ModelTypes.PoolModel,
    component: PoolEditor,
    persistenceStrategyFactory: () => new DeferredPersistenceStrategy(),
    listeningApproach: ListeningApproach.WhenReadOnly,
    protected: true,
  });

}
