import { Map } from 'immutable';
import * as models from 'data/models';
import { LearningObjective, Skill } from 'data/contentTypes';

export type AppContext = {
  userId: string;
  documentId: string;
  orgId: string;
  baseUrl: string;
  resourcePath: string;
  courseModel: models.CourseModel;
  undoRedoGuid: string;
  undoRedoActionGuid: string;
  skills: Map<string, Skill>;
  objectives: Map<string, LearningObjective>;
};
