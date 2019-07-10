import { Map } from 'immutable';
import * as models from 'data/models';
import { LearningObjective, Skill } from 'data/contentTypes';
import { DocumentId, ResourceId } from 'data/types';

export type AppContext = {
  userId: string;
  documentId: DocumentId;
  orgId: ResourceId;
  baseUrl: string;
  resourcePath: string;
  courseModel: models.CourseModel;
  undoRedoGuid: string;
  skills: Map<string, Skill>;
  objectives: Map<string, LearningObjective>;
};
