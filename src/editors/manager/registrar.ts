
import WorkbookPageEditor from '../document/workbook/WorkbookPageEditor.controller';
import AssessmentEditor from '../document/assessment/AssessmentEditor.controller';
import CourseEditor from '../document/course/CourseEditor.controller';
import OrgEditor from '../document/org/OrgEditor.controller';
import PoolEditor from '../document/pool/PoolEditor.controller';

import { DeferredPersistenceStrategy } from './persistence/DeferredPersistenceStrategy';
import { ImmediatePersistenceStrategy } from './persistence/ImmediatePersistenceStrategy';
import { ListeningApproach } from './ListeningApproach';

import { ModelTypes } from '../../data/models';
import { register } from './registry';

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
